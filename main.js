import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getGameStats } from './getdata.js';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

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

async function getUniverseIdFromPlaceId(placeId) {
    const response = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    const data = await response.json();
    return data.universeId;
}

async function loadGames() {
    const data = await fs.readFile(path.join(__dirname, 'games-data.json'), 'utf8');
    return JSON.parse(data).games;
}

async function loadBlogPosts() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'blog-posts.json'), 'utf8');
        return JSON.parse(data).posts || [];
    } catch {
        return [];
    }
}

// Endpoint for games data (what your HTML expects)
app.get('/api/games', async (req, res) => {
    try {
        let games = await loadGames();
        
        // Add stats to each game
        for (const game of games) {
            const universeId = await getUniverseIdFromPlaceId(game.placeId);
            if (universeId) {
                const stats = await getGameStats(universeId);
                game.universeId = universeId;
                game.visits = stats.visits;
                game.playing = stats.playing;
            }
        }
        
        res.json({ games });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

// Endpoint for blog posts (what your HTML expects)
app.get('/api/blog/posts', async (req, res) => {
    try {
        const posts = await loadBlogPosts();
        res.json({ posts });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));