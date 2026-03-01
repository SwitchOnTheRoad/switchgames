import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getGameStats } from './getData.js';
import fs from 'fs/promises';
import { createHash, randomBytes } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { extname } from 'path';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create uploads folder if it doesn't exist
if (!existsSync('./uploads')) mkdirSync('./uploads');

// ============================================================
// MULTER SETUP
// ============================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'),
    filename: (req, file, cb) => cb(null, `${randomBytes(8).toString('hex')}${extname(file.originalname)}`)
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
        cb(null, true);
    }
});

// Serve uploads folder
app.use('/uploads', express.static('./uploads'));

// ============================================================
// ADMIN AUTH
// ============================================================

const ADMIN_PASSWORD_HASH = '92566b61eb9f0568cc88f598ba75d8836e657de4e40d069ccc22ac62b5075fa0';
const adminSessions = new Map();

function hashPassword(p) { return createHash('sha256').update(p).digest('hex'); }
function generateToken() { return randomBytes(32).toString('hex'); }
function isValidToken(token) {
    const session = adminSessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expiresAt) { adminSessions.delete(token); return false; }
    return true;
}

app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password required' });
    if (hashPassword(password) !== ADMIN_PASSWORD_HASH) return res.status(401).json({ message: 'Invalid password' });
    const token = generateToken();
    adminSessions.set(token, { expiresAt: Date.now() + 1000 * 60 * 60 * 8 });
    res.status(200).json({ message: 'Login successful', token });
});

app.post('/api/admin/logout', (req, res) => {
    const token = req.headers['x-admin-token'];
    if (token) adminSessions.delete(token);
    res.status(200).json({ message: 'Logged out' });
});

// ============================================================
// IMAGE UPLOAD
// ============================================================

app.post('/api/admin/upload', (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    upload.single('image')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        res.status(200).json({ url: `/uploads/${req.file.filename}` });
    });
});

// ============================================================
// ROUTES
// ============================================================

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// HTML routing middleware (remove .html from URLs)
app.use((req, res, next) => {
    if (req.path.endsWith('.html')) {
        res.redirect(req.path.slice(0, -5));
    } else if (!req.path.includes('.')) {
        const htmlPath = path.join(__dirname, 'public', req.path + '.html');
        fs.access(htmlPath).then(() => {
            res.sendFile(htmlPath);
        }).catch(() => next());
    } else {
        next();
    }
});

// ============================================================
// STATS
// ============================================================

async function getUniverseIdFromPlaceId(placeId) {
    const response = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    const data = await response.json();
    return data.universeId;
}

async function loadGames() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'games-data.json'), 'utf8');
        return JSON.parse(data).games;
    } catch {
        return [];
    }
}

async function loadBlogPosts() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'blog-posts.json'), 'utf8');
        return JSON.parse(data).posts || [];
    } catch {
        return [];
    }
}

async function loadCareers() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'careers-data.json'), 'utf8');
        return JSON.parse(data).careers || [];
    } catch {
        return [];
    }
}

// ============================================================
// GAMES ENDPOINTS
// ============================================================

app.get('/api/games', async (req, res) => {
    try {
        const games = await loadGames();
        const filtered = games.filter(g => g.active !== false);
        
        const enriched = await Promise.all(filtered.map(async (game) => {
            try {
                let universeId = game.universeId;
                if (!universeId && game.placeId) {
                    universeId = await getUniverseIdFromPlaceId(game.placeId);
                }
                
                if (universeId) {
                    const stats = await getGameStats(universeId);
                    return {
                        ...game,
                        universeId,
                        visits: stats.visits,
                        playing: stats.playing,
                        name: stats.name,
                        description: stats.description
                    };
                }
            } catch (err) {
                console.error(`Failed to fetch stats for ${game.placeId}:`, err);
            }
            return game;
        }));
        
        res.json({ games: enriched });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

app.get('/api/admin/games', (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    
    fs.readFile(path.join(__dirname, 'games-data.json'), 'utf8')
        .then(data => res.json({ games: JSON.parse(data).games || [] }))
        .catch(() => res.json({ games: [] }));
});

app.post('/api/admin/games', async (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    
    const { placeId, featured, active, thumbnail } = req.body;
    
    try {
        const games = await loadGames();
        const newGame = {
            id: randomBytes(8).toString('hex'),
            placeId: String(placeId || ''),
            universeId: '',
            thumbnail: thumbnail || '',
            featured: featured || false,
            active: active !== false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        games.unshift(newGame);
        
        await fs.writeFile(
            path.join(__dirname, 'games-data.json'),
            JSON.stringify({ games }, null, 2)
        );
        
        res.status(201).json({ message: 'Game created', game: newGame });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create game' });
    }
});

app.put('/api/admin/games/:id', async (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    
    try {
        const games = await loadGames();
        const index = games.findIndex(g => g.id === req.params.id);
        if (index === -1) return res.status(404).json({ message: 'Game not found' });
        
        games[index] = { ...games[index], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
        
        await fs.writeFile(
            path.join(__dirname, 'games-data.json'),
            JSON.stringify({ games }, null, 2)
        );
        
        res.json({ message: 'Game updated', game: games[index] });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update game' });
    }
});

app.delete('/api/admin/games/:id', async (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    
    try {
        const games = await loadGames();
        const filtered = games.filter(g => g.id !== req.params.id);
        if (filtered.length === games.length) return res.status(404).json({ message: 'Game not found' });
        
        await fs.writeFile(
            path.join(__dirname, 'games-data.json'),
            JSON.stringify({ games: filtered }, null, 2)
        );
        
        res.json({ message: 'Game deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete game' });
    }
});

// ============================================================
// BLOG ENDPOINTS
// ============================================================

app.get('/api/blog/posts', async (req, res) => {
    try {
        const posts = await loadBlogPosts();
        res.json({ posts: posts.filter(p => p.published !== false) });
    } catch {
        res.json({ posts: [] });
    }
});

app.get('/api/admin/posts', (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    
    fs.readFile(path.join(__dirname, 'blog-posts.json'), 'utf8')
        .then(data => res.json({ posts: JSON.parse(data).posts || [] }))
        .catch(() => res.json({ posts: [] }));
});

app.post('/api/admin/posts', async (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    
    const { title, content, published } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    
    try {
        const posts = await loadBlogPosts();
        const newPost = {
            id: randomBytes(8).toString('hex'),
            title,
            content: content || '',
            published: published || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        posts.unshift(newPost);
        
        await fs.writeFile(
            path.join(__dirname, 'blog-posts.json'),
            JSON.stringify({ posts }, null, 2)
        );
        
        res.status(201).json({ message: 'Post created', post: newPost });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create post' });
    }
});

app.put('/api/admin/posts/:id', async (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    
    try {
        const posts = await loadBlogPosts();
        const index = posts.findIndex(p => p.id === req.params.id);
        if (index === -1) return res.status(404).json({ message: 'Post not found' });
        
        posts[index] = { ...posts[index], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
        
        await fs.writeFile(
            path.join(__dirname, 'blog-posts.json'),
            JSON.stringify({ posts }, null, 2)
        );
        
        res.json({ message: 'Post updated', post: posts[index] });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update post' });
    }
});

app.delete('/api/admin/posts/:id', async (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    
    try {
        const posts = await loadBlogPosts();
        const filtered = posts.filter(p => p.id !== req.params.id);
        if (filtered.length === posts.length) return res.status(404).json({ message: 'Post not found' });
        
        await fs.writeFile(
            path.join(__dirname, 'blog-posts.json'),
            JSON.stringify({ posts: filtered }, null, 2)
        );
        
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete post' });
    }
});

// ============================================================
// CAREERS ENDPOINTS
// ============================================================

app.get('/api/careers', async (req, res) => {
    try {
        const careers = await loadCareers();
        res.json({ careers: careers.filter(c => c.active !== false) });
    } catch {
        res.json({ careers: [] });
    }
});

app.get('/api/admin/careers', (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    
    fs.readFile(path.join(__dirname, 'careers-data.json'), 'utf8')
        .then(data => res.json({ careers: JSON.parse(data).careers || [] }))
        .catch(() => res.json({ careers: [] }));
});

app.post('/api/admin/careers', async (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    
    const { title, department, type, location, description, requirements, niceToHave, questions, active } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    
    try {
        const careers = await loadCareers();
        const newCareer = {
            id: randomBytes(8).toString('hex'),
            title,
            department: department || '',
            type: type || 'Full-time',
            location: location || 'Remote',
            description: description || '',
            requirements: requirements || [],
            niceToHave: niceToHave || [],
            questions: questions || [],
            active: active !== false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        careers.unshift(newCareer);
        
        await fs.writeFile(
            path.join(__dirname, 'careers-data.json'),
            JSON.stringify({ careers }, null, 2)
        );
        
        res.status(201).json({ message: 'Career created', career: newCareer });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create career' });
    }
});

app.put('/api/admin/careers/:id', async (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    
    try {
        const careers = await loadCareers();
        const index = careers.findIndex(c => c.id === req.params.id);
        if (index === -1) return res.status(404).json({ message: 'Career not found' });
        
        careers[index] = { ...careers[index], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
        
        await fs.writeFile(
            path.join(__dirname, 'careers-data.json'),
            JSON.stringify({ careers }, null, 2)
        );
        
        res.json({ message: 'Career updated', career: careers[index] });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update career' });
    }
});

app.delete('/api/admin/careers/:id', async (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    
    try {
        const careers = await loadCareers();
        const filtered = careers.filter(c => c.id !== req.params.id);
        if (filtered.length === careers.length) return res.status(404).json({ message: 'Career not found' });
        
        await fs.writeFile(
            path.join(__dirname, 'careers-data.json'),
            JSON.stringify({ careers: filtered }, null, 2)
        );
        
        res.json({ message: 'Career deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete career' });
    }
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});