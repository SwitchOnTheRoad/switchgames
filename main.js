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

app.use(express.json({ limit: '2mb' }));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Block direct access to sensitive JSON files
    const blocked = ['contacts.json','applications.json','staff.json','staff-accounts.json'];
    if (blocked.some(f => req.path === '/' + f)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
});

app.use(express.static(__dirname, { index: 'index.html' }));

if (!existsSync('./uploads')) mkdirSync('./uploads');
app.use('/uploads', express.static('./uploads'));

// Multer
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

// ============================================================
// ADMIN AUTH
// ============================================================

const MASTER_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '25041dace945e0a85a78c93c681456626b017391ba108bf29bebde1704c85672';
const adminSessions = new Map();
const loginAttempts = new Map();
const MAX_ATTEMPTS = 10;
const ATTEMPT_WINDOW = 15 * 60 * 1000;

function checkBruteForce(ip) {
    const now = Date.now();
    let r = loginAttempts.get(ip);
    if (!r || now > r.resetAt) { r = { count: 0, resetAt: now + ATTEMPT_WINDOW }; loginAttempts.set(ip, r); }
    return r.count < MAX_ATTEMPTS;
}
function recordFail(ip) {
    const now = Date.now();
    let r = loginAttempts.get(ip);
    if (!r || now > r.resetAt) r = { count: 0, resetAt: now + ATTEMPT_WINDOW };
    r.count++; loginAttempts.set(ip, r);
}
function clearAttempts(ip) { loginAttempts.delete(ip); }

function hashPassword(p) { return createHash('sha256').update(p).digest('hex'); }
function generateToken() { return randomBytes(32).toString('hex'); }
function getSession(token) {
    const s = adminSessions.get(token);
    if (!s) return null;
    if (Date.now() > s.expiresAt) { adminSessions.delete(token); return null; }
    return s;
}
function isValidToken(token) { return !!getSession(token); }

// Staff accounts
const STAFF_ACCOUNTS_FILE = './staff-accounts.json';
function readStaffAccounts() { try { return JSON.parse(readFileSync(STAFF_ACCOUNTS_FILE, 'utf-8')).accounts; } catch { return []; } }
function writeStaffAccounts(a) { writeFileSync(STAFF_ACCOUNTS_FILE, JSON.stringify({ accounts: a }, null, 2), 'utf-8'); }

// Staff directory
const STAFF_FILE = './staff.json';
function readStaff() { try { return JSON.parse(readFileSync(STAFF_FILE, 'utf-8')).staff; } catch { return []; } }
function writeStaff(s) { writeFileSync(STAFF_FILE, JSON.stringify({ staff: s }, null, 2), 'utf-8'); }

// Contacts
const CONTACTS_FILE = './contacts.json';
function readContacts() { try { return JSON.parse(readFileSync(CONTACTS_FILE, 'utf-8')).contacts; } catch { return []; } }
function writeContacts(c) { writeFileSync(CONTACTS_FILE, JSON.stringify({ contacts: c }, null, 2), 'utf-8'); }

// Applications
const APPLICATIONS_FILE = './applications.json';
function readApplications() { try { return JSON.parse(readFileSync(APPLICATIONS_FILE, 'utf-8')).applications; } catch { return []; } }
function writeApplications(a) { writeFileSync(APPLICATIONS_FILE, JSON.stringify({ applications: a }, null, 2), 'utf-8'); }

// Blog
async function loadBlogPosts() {
    try { return JSON.parse(await fs.readFile(path.join(__dirname, 'blog-posts.json'), 'utf8')).posts || []; }
    catch { return []; }
}

// Games
async function loadGames() {
    try { return JSON.parse(await fs.readFile(path.join(__dirname, 'games-data.json'), 'utf8')).games || []; }
    catch { return []; }
}

// Careers
async function loadCareers() {
    try { return JSON.parse(await fs.readFile(path.join(__dirname, 'careers-data.json'), 'utf8')).careers || []; }
    catch { return []; }
}

// ============================================================
// LOGIN
// ============================================================

app.post('/api/admin/login', (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    const { password, username } = req.body;
    if (!password) return res.status(400).json({ message: 'Password required' });
    if (!checkBruteForce(ip)) return res.status(429).json({ message: 'Too many failed attempts. Try again in 15 minutes.' });

    // Master admin check
    if (!username || username === 'admin') {
        if (hashPassword(password) === MASTER_PASSWORD_HASH) {
            clearAttempts(ip);
            const token = generateToken();
            adminSessions.set(token, { expiresAt: Date.now() + 8 * 60 * 60 * 1000, role: 'superadmin', accountId: 'master' });
            return res.json({ message: 'Login successful', token, role: 'superadmin', displayName: 'Admin' });
        }
    }

    // Staff account check
    const accounts = readStaffAccounts();
    const account = username && accounts.find(a => a.username.toLowerCase() === username.toLowerCase() && hashPassword(password) === a.passwordHash);
    if (account) {
        clearAttempts(ip);
        account.lastLogin = new Date().toISOString();
        writeStaffAccounts(accounts);
        const token = generateToken();
        adminSessions.set(token, { expiresAt: Date.now() + 8 * 60 * 60 * 1000, role: account.role, accountId: account.id });
        return res.json({ message: 'Login successful', token, role: account.role, displayName: account.displayName });
    }

    recordFail(ip);
    res.status(401).json({ message: 'Invalid credentials' });
});

app.post('/api/admin/logout', (req, res) => {
    const token = req.headers['x-admin-token'];
    if (token) adminSessions.delete(token);
    res.json({ message: 'Logged out' });
});

// Image upload
app.post('/api/admin/upload', (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidToken(token)) return res.status(401).json({ message: 'Unauthorised' });
    upload.single('image')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        res.json({ url: `/uploads/${req.file.filename}` });
    });
});

// ============================================================
// STAFF ACCOUNTS (superadmin only)
// ============================================================

app.get('/api/admin/staff-accounts', (req, res) => {
    const s = getSession(req.headers['x-admin-token']);
    if (!s) return res.status(401).json({ message: 'Unauthorised' });
    if (s.role !== 'superadmin') return res.status(403).json({ message: 'Forbidden' });
    res.json({ accounts: readStaffAccounts().map(a => ({ ...a, passwordHash: undefined })) });
});

app.post('/api/admin/staff-accounts', (req, res) => {
    const s = getSession(req.headers['x-admin-token']);
    if (!s) return res.status(401).json({ message: 'Unauthorised' });
    if (s.role !== 'superadmin') return res.status(403).json({ message: 'Forbidden' });
    const { username, password, displayName, role } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be 8+ characters' });
    const accounts = readStaffAccounts();
    if (accounts.find(a => a.username.toLowerCase() === username.toLowerCase())) return res.status(409).json({ message: 'Username taken' });
    const newAcc = { id: randomBytes(8).toString('hex'), username: username.trim(), passwordHash: hashPassword(password), displayName: displayName || username, role: ['editor','moderator','admin'].includes(role) ? role : 'editor', createdAt: new Date().toISOString(), lastLogin: null };
    accounts.push(newAcc);
    writeStaffAccounts(accounts);
    res.status(201).json({ message: 'Account created', account: { ...newAcc, passwordHash: undefined } });
});

app.put('/api/admin/staff-accounts/:id', (req, res) => {
    const s = getSession(req.headers['x-admin-token']);
    if (!s) return res.status(401).json({ message: 'Unauthorised' });
    if (s.role !== 'superadmin') return res.status(403).json({ message: 'Forbidden' });
    const accounts = readStaffAccounts();
    const idx = accounts.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    const { displayName, role, newPassword } = req.body;
    if (displayName) accounts[idx].displayName = displayName;
    if (role && ['editor','moderator','admin'].includes(role)) accounts[idx].role = role;
    if (newPassword) {
        if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be 8+ characters' });
        accounts[idx].passwordHash = hashPassword(newPassword);
        for (const [t, sess] of adminSessions.entries()) { if (sess.accountId === accounts[idx].id) adminSessions.delete(t); }
    }
    writeStaffAccounts(accounts);
    res.json({ message: 'Updated', account: { ...accounts[idx], passwordHash: undefined } });
});

app.delete('/api/admin/staff-accounts/:id', (req, res) => {
    const s = getSession(req.headers['x-admin-token']);
    if (!s) return res.status(401).json({ message: 'Unauthorised' });
    if (s.role !== 'superadmin') return res.status(403).json({ message: 'Forbidden' });
    const accounts = readStaffAccounts();
    const acc = accounts.find(a => a.id === req.params.id);
    if (!acc) return res.status(404).json({ message: 'Not found' });
    for (const [t, sess] of adminSessions.entries()) { if (sess.accountId === acc.id) adminSessions.delete(t); }
    writeStaffAccounts(accounts.filter(a => a.id !== req.params.id));
    res.json({ message: 'Deleted' });
});

// ============================================================
// STAFF DIRECTORY
// ============================================================

app.get('/api/admin/staff', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    res.json({ staff: readStaff() });
});

app.post('/api/admin/staff', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const { name, role, department, discord, roblox, status, notes, avatar } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const staff = readStaff();
    const m = { id: randomBytes(8).toString('hex'), name: name.trim(), role: role||'', department: department||'', discord: discord||'', roblox: roblox||'', status: status||'active', notes: notes||'', avatar: avatar||'', joinedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    staff.unshift(m);
    writeStaff(staff);
    res.status(201).json({ message: 'Added', member: m });
});

app.put('/api/admin/staff/:id', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const staff = readStaff();
    const idx = staff.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    staff[idx] = { ...staff[idx], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
    writeStaff(staff);
    res.json({ message: 'Updated', member: staff[idx] });
});

app.delete('/api/admin/staff/:id', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const staff = readStaff();
    const filtered = staff.filter(s => s.id !== req.params.id);
    if (filtered.length === staff.length) return res.status(404).json({ message: 'Not found' });
    writeStaff(filtered);
    res.json({ message: 'Deleted' });
});

// ============================================================
// CONTACT
// ============================================================

app.post('/api/contact', (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) return res.status(400).json({ message: 'All fields are required' });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email address' });
        const contacts = readContacts();
        contacts.unshift({ id: randomBytes(8).toString('hex'), name: name.slice(0,200), email: email.slice(0,200), subject: subject.slice(0,500), message: message.slice(0,5000), read: false, createdAt: new Date().toISOString() });
        writeContacts(contacts);
        res.json({ message: 'Message sent successfully' });
    } catch (err) {
        console.error('Contact error:', err);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

app.get('/api/admin/contacts', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    res.json({ contacts: readContacts() });
});

app.patch('/api/admin/contacts/:id/read', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const contacts = readContacts();
    const idx = contacts.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    contacts[idx].read = true; writeContacts(contacts);
    res.json({ contact: contacts[idx] });
});

app.delete('/api/admin/contacts/:id', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    writeContacts(readContacts().filter(c => c.id !== req.params.id));
    res.json({ message: 'Deleted' });
});

// ============================================================
// APPLICATIONS
// ============================================================

app.post('/api/apply', (req, res) => {
    try {
        const { position, name, email, discord, portfolio, experience, answers } = req.body;
        if (!position || !name || !email || !experience) return res.status(400).json({ message: 'Required fields missing' });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email' });
        const applications = readApplications();
        applications.unshift({ id: randomBytes(8).toString('hex'), position: position.slice(0,200), name: name.slice(0,200), email: email.slice(0,200), discord: (discord||'').slice(0,200), portfolio: (portfolio||'').slice(0,500), experience: experience.slice(0,5000), answers: Array.isArray(answers) ? answers.slice(0,20) : [], status: 'new', read: false, createdAt: new Date().toISOString() });
        writeApplications(applications);
        res.json({ message: 'Application submitted successfully' });
    } catch (err) {
        console.error('Application error:', err);
        res.status(500).json({ message: 'Failed to submit application' });
    }
});

app.get('/api/admin/applications', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    res.json({ applications: readApplications() });
});

app.patch('/api/admin/applications/:id/status', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const apps = readApplications();
    const idx = apps.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    if (req.body.status) apps[idx].status = req.body.status;
    apps[idx].read = true; writeApplications(apps);
    res.json({ application: apps[idx] });
});

app.delete('/api/admin/applications/:id', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    writeApplications(readApplications().filter(a => a.id !== req.params.id));
    res.json({ message: 'Deleted' });
});

// ============================================================
// STATS
// ============================================================

app.get('/api/get-total-visits', (req, res) => res.json({ message: 'ok', value: 0 }));
app.get('/api/get-total-ccu', (req, res) => res.json({ message: 'ok', value: 0 }));

// ============================================================
// GAMES
// ============================================================

async function getUniverseIdFromPlaceId(placeId) {
    const r = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    return (await r.json()).universeId;
}

app.get('/api/games', async (req, res) => {
    try {
        const games = (await loadGames()).filter(g => g.active !== false);
        const enriched = await Promise.all(games.map(async (game) => {
            try {
                let uid = game.universeId;
                if (!uid && game.placeId) uid = await getUniverseIdFromPlaceId(game.placeId);
                if (uid) {
                    const stats = await getGameStats(uid);
                    return { ...game, universeId: uid, visits: stats.visits, playing: stats.playing, name: stats.name, description: stats.description };
                }
            } catch (e) { console.error(`Roblox fetch fail for ${game.placeId}:`, e.message); }
            return game;
        }));
        res.json({ games: enriched });
    } catch (e) { res.status(500).json({ error: 'Failed to fetch games' }); }
});

app.get('/api/admin/games', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    res.json({ games: await loadGames() });
});

app.post('/api/admin/games', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const { placeId, featured, active, thumbnail } = req.body;
    try {
        const games = await loadGames();
        const g = { id: randomBytes(8).toString('hex'), placeId: String(placeId||''), universeId: '', thumbnail: thumbnail||'', featured: featured||false, active: active!==false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        games.unshift(g);
        await fs.writeFile(path.join(__dirname, 'games-data.json'), JSON.stringify({ games }, null, 2));
        res.status(201).json({ message: 'Game created', game: g });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

app.put('/api/admin/games/:id', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    try {
        const games = await loadGames();
        const i = games.findIndex(g => g.id === req.params.id);
        if (i === -1) return res.status(404).json({ message: 'Not found' });
        games[i] = { ...games[i], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
        await fs.writeFile(path.join(__dirname, 'games-data.json'), JSON.stringify({ games }, null, 2));
        res.json({ message: 'Updated', game: games[i] });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

app.delete('/api/admin/games/:id', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    try {
        const games = await loadGames();
        const filtered = games.filter(g => g.id !== req.params.id);
        if (filtered.length === games.length) return res.status(404).json({ message: 'Not found' });
        await fs.writeFile(path.join(__dirname, 'games-data.json'), JSON.stringify({ games: filtered }, null, 2));
        res.json({ message: 'Deleted' });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

// ============================================================
// BLOG
// ============================================================

app.get('/api/blog/posts', async (req, res) => {
    try { res.json({ posts: (await loadBlogPosts()).filter(p => p.published !== false) }); }
    catch { res.json({ posts: [] }); }
});

app.get('/api/blog/posts/:id', async (req, res) => {
    try {
        const post = (await loadBlogPosts()).find(p => p.id === req.params.id && p.published !== false);
        if (!post) return res.status(404).json({ message: 'Not found' });
        res.json({ post });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

app.get('/api/admin/posts', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    res.json({ posts: await loadBlogPosts() });
});

app.post('/api/admin/posts', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const { title, content, published, author } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    try {
        const posts = await loadBlogPosts();
        const p = { id: randomBytes(8).toString('hex'), title, content: content||'', published: published||false, author: author||'', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        posts.unshift(p);
        await fs.writeFile(path.join(__dirname, 'blog-posts.json'), JSON.stringify({ posts }, null, 2));
        res.status(201).json({ message: 'Created', post: p });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

app.put('/api/admin/posts/:id', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    try {
        const posts = await loadBlogPosts();
        const i = posts.findIndex(p => p.id === req.params.id);
        if (i === -1) return res.status(404).json({ message: 'Not found' });
        posts[i] = { ...posts[i], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
        await fs.writeFile(path.join(__dirname, 'blog-posts.json'), JSON.stringify({ posts }, null, 2));
        res.json({ message: 'Updated', post: posts[i] });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

app.delete('/api/admin/posts/:id', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    try {
        const posts = await loadBlogPosts();
        const filtered = posts.filter(p => p.id !== req.params.id);
        if (filtered.length === posts.length) return res.status(404).json({ message: 'Not found' });
        await fs.writeFile(path.join(__dirname, 'blog-posts.json'), JSON.stringify({ posts: filtered }, null, 2));
        res.json({ message: 'Deleted' });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

// ============================================================
// CAREERS
// ============================================================

app.get('/api/careers', async (req, res) => {
    try { res.json({ careers: (await loadCareers()).filter(c => c.active !== false) }); }
    catch { res.json({ careers: [] }); }
});

app.get('/api/careers/:id', async (req, res) => {
    try {
        const career = (await loadCareers()).find(c => c.id === req.params.id && c.active !== false);
        if (!career) return res.status(404).json({ message: 'Not found' });
        res.json({ career });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

app.get('/api/admin/careers', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    res.json({ careers: await loadCareers() });
});

app.post('/api/admin/careers', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const { title, department, type, location, description, requirements, niceToHave, questions, active, salary } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    try {
        const careers = await loadCareers();
        const c = { id: randomBytes(8).toString('hex'), title, department: department||'', type: type||'Full-time', location: location||'Remote', description: description||'', requirements: requirements||[], niceToHave: niceToHave||[], questions: questions||[], active: active!==false, salary: salary||'', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        careers.unshift(c);
        await fs.writeFile(path.join(__dirname, 'careers-data.json'), JSON.stringify({ careers }, null, 2));
        res.status(201).json({ message: 'Created', career: c });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

app.put('/api/admin/careers/:id', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    try {
        const careers = await loadCareers();
        const i = careers.findIndex(c => c.id === req.params.id);
        if (i === -1) return res.status(404).json({ message: 'Not found' });
        careers[i] = { ...careers[i], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
        await fs.writeFile(path.join(__dirname, 'careers-data.json'), JSON.stringify({ careers }, null, 2));
        res.json({ message: 'Updated', career: careers[i] });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

app.delete('/api/admin/careers/:id', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    try {
        const careers = await loadCareers();
        const filtered = careers.filter(c => c.id !== req.params.id);
        if (filtered.length === careers.length) return res.status(404).json({ message: 'Not found' });
        await fs.writeFile(path.join(__dirname, 'careers-data.json'), JSON.stringify({ careers: filtered }, null, 2));
        res.json({ message: 'Deleted' });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

// ============================================================
// HTML ROUTING
// ============================================================

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.includes('.')) return next();
    const htmlPath = path.join(__dirname, req.path + '.html');
    fs.access(htmlPath).then(() => res.sendFile(htmlPath)).catch(() => next());
});

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, '404.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));