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

// ROOT = ./public/ (where all HTML, assets and JSON data files live)
const ROOT = path.join(process.cwd(), 'public');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));


app.use((req, res, next) => {
    if (req.method === 'GET' && isPublicPagePath(req.path)) {
        const views = readPageViews();
        views.unshift({ path: req.path, at: new Date().toISOString() });
        writePageViews(views);
    }
    next();
});

// Security headers (no CSP — Quill editor needs unsafe-eval)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Admin relies on Quill (which uses dynamic code paths) and inline scripts.
    // Explicitly set a compatible CSP so browser/proxy defaults do not block login/app boot.
    if (req.path === '/admin.html' || req.path.startsWith('/api/admin')) {
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self';"
        );
    }
    // Block direct access to sensitive JSON files
    const blocked = ['contacts.json','applications.json','staff.json','staff-accounts.json'];
    if (blocked.some(f => req.path === '/' + f)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
});

// Serve static files from the project root
app.use(express.static(ROOT, { index: 'index.html' }));

const UPLOADS_DIR = path.join(process.env.DATA_DIR || __dirname, 'uploads');
if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
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

// Default master password: SwitchGamesAdmin  (override via ADMIN_PASSWORD_HASH env var)
const MASTER_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '92566b61eb9f0568cc88f598ba75d8836e657de4e40d069ccc22ac62b5075fa0';
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

// DATA_ROOT = persistent disk in production, project root in dev
// Set DATA_DIR=/var/data in Render environment variables
const DATA_ROOT = process.env.DATA_DIR || __dirname;

// On first boot, seed the persistent disk with any JSON files that don't exist yet
const DATA_FILES = [
    'blog-posts.json', 'games-data.json', 'careers-data.json',
    'site-settings.json', 'staff-accounts.json', 'audit-log.json',
    'page-views.json', 'staff.json', 'contacts.json', 'applications.json'
];
if (process.env.DATA_DIR) {
    if (!existsSync(DATA_ROOT)) mkdirSync(DATA_ROOT, { recursive: true });
    for (const f of DATA_FILES) {
        const dest = path.join(DATA_ROOT, f);
        const src = path.join(__dirname, f);
        if (!existsSync(dest) && existsSync(src)) {
            try { writeFileSync(dest, readFileSync(src)); console.log(`✅ Seeded ${f} to persistent disk`); }
            catch (e) { console.warn(`⚠️  Could not seed ${f}:`, e.message); }
        }
    }
}

// Staff accounts
const STAFF_ACCOUNTS_FILE = path.join(DATA_ROOT, 'staff-accounts.json');
function readStaffAccounts() { try { return JSON.parse(readFileSync(STAFF_ACCOUNTS_FILE, 'utf-8')).accounts; } catch { return []; } }
function writeStaffAccounts(a) { writeFileSync(STAFF_ACCOUNTS_FILE, JSON.stringify({ accounts: a }, null, 2), 'utf-8'); }

// Staff directory
const STAFF_FILE = path.join(DATA_ROOT, 'staff.json');
function readStaff() { try { return JSON.parse(readFileSync(STAFF_FILE, 'utf-8')).staff; } catch { return []; } }
function writeStaff(s) { writeFileSync(STAFF_FILE, JSON.stringify({ staff: s }, null, 2), 'utf-8'); }

// Contacts
const CONTACTS_FILE = path.join(DATA_ROOT, 'contacts.json');
function readContacts() { try { return JSON.parse(readFileSync(CONTACTS_FILE, 'utf-8')).contacts; } catch { return []; } }
function writeContacts(c) { writeFileSync(CONTACTS_FILE, JSON.stringify({ contacts: c }, null, 2), 'utf-8'); }

// Applications
const APPLICATIONS_FILE = path.join(DATA_ROOT, 'applications.json');
function readApplications() { try { return JSON.parse(readFileSync(APPLICATIONS_FILE, 'utf-8')).applications; } catch { return []; } }
function writeApplications(a) { writeFileSync(APPLICATIONS_FILE, JSON.stringify({ applications: a }, null, 2), 'utf-8'); }


const SITE_SETTINGS_FILE = path.join(DATA_ROOT, 'site-settings.json');
const AUDIT_LOG_FILE = path.join(DATA_ROOT, 'audit-log.json');
const PAGE_VIEWS_FILE = path.join(DATA_ROOT, 'page-views.json');

const DEFAULT_SETTINGS = {
    announcement: {
        enabled: false,
        text: '',
        background: '#FBBF24',
        textColor: '#0A0A0A',
        link: ''
    }
};

function readSiteSettings() {
    try {
        const parsed = JSON.parse(readFileSync(SITE_SETTINGS_FILE, 'utf-8'));
        return {
            ...DEFAULT_SETTINGS,
            ...(parsed || {}),
            announcement: {
                ...DEFAULT_SETTINGS.announcement,
                ...((parsed || {}).announcement || {})
            }
        };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}
function writeSiteSettings(settings) { writeFileSync(SITE_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8'); }

function readAuditLog() { try { return JSON.parse(readFileSync(AUDIT_LOG_FILE, 'utf-8')).entries || []; } catch { return []; } }
function writeAuditLog(entries) { writeFileSync(AUDIT_LOG_FILE, JSON.stringify({ entries: entries.slice(0, 1000) }, null, 2), 'utf-8'); }

function readPageViews() { try { return JSON.parse(readFileSync(PAGE_VIEWS_FILE, 'utf-8')).views || []; } catch { return []; } }
function writePageViews(views) { writeFileSync(PAGE_VIEWS_FILE, JSON.stringify({ views: views.slice(0, 5000) }, null, 2), 'utf-8'); }

function logAudit(action, req, details = {}) {
    const token = req.headers['x-admin-token'];
    const session = token ? getSession(token) : null;
    const entries = readAuditLog();
    entries.unshift({
        id: randomBytes(8).toString('hex'),
        at: new Date().toISOString(),
        action,
        actorRole: session?.role || 'unknown',
        actorAccountId: session?.accountId || 'unknown',
        ip: req.ip || req.connection?.remoteAddress || '',
        details
    });
    writeAuditLog(entries);
}

function isPublicPagePath(pathname) {
    if (!pathname) return false;
    if (pathname.startsWith('/api/') || pathname.startsWith('/uploads/') || pathname === '/admin.html') return false;
    if (pathname.includes('.')) return ['.html', '.htm'].some(ext => pathname.endsWith(ext));
    return true;
}
function toCsv(rows) {
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    const escape = (v) => {
        const value = v == null ? '' : String(v);
        return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    };
    return [headers.join(','), ...rows.map(row => headers.map(h => escape(row[h])).join(','))].join('\n');
}

// Blog
async function loadBlogPosts() {
    try { return JSON.parse(await fs.readFile(path.join(DATA_ROOT, 'blog-posts.json'), 'utf8')).posts || []; }
    catch { return []; }
}

// Games
async function loadGames() {
    try { return JSON.parse(await fs.readFile(path.join(DATA_ROOT, 'games-data.json'), 'utf8')).games || []; }
    catch { return []; }
}

// Careers
async function loadCareers() {
    try { return JSON.parse(await fs.readFile(path.join(DATA_ROOT, 'careers-data.json'), 'utf8')).careers || []; }
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
            logAudit('admin.login', req, { accountId: 'master', role: 'superadmin' });
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
        logAudit('admin.login', req, { accountId: account.id, role: account.role });
        return res.json({ message: 'Login successful', token, role: account.role, displayName: account.displayName, avatar: account.avatar || '', position: account.position || '', accountId: account.id });
    }

    recordFail(ip);
    res.status(401).json({ message: 'Invalid credentials' });
});

app.post('/api/admin/logout', (req, res) => {
    const token = req.headers['x-admin-token'];
    if (token) {
        logAudit('admin.logout', req);
        adminSessions.delete(token);
    }
    res.json({ message: 'Logged out' });
});

// ============================================================
// MY PROFILE  (any authenticated user can manage their own profile)
// ============================================================

app.get('/api/admin/me', (req, res) => {
    const s = getSession(req.headers['x-admin-token']);
    if (!s) return res.status(401).json({ message: 'Unauthorised' });
    if (s.accountId === 'master') {
        return res.json({ id: 'master', username: 'admin', displayName: 'Admin', role: 'superadmin', position: '', bio: '', avatar: '' });
    }
    const accounts = readStaffAccounts();
    const acc = accounts.find(a => a.id === s.accountId);
    if (!acc) return res.status(404).json({ message: 'Account not found' });
    const { passwordHash, ...safe } = acc;
    res.json(safe);
});

app.put('/api/admin/me', (req, res) => {
    const s = getSession(req.headers['x-admin-token']);
    if (!s) return res.status(401).json({ message: 'Unauthorised' });
    if (s.accountId === 'master') return res.status(400).json({ message: 'Master account cannot be edited here' });
    const accounts = readStaffAccounts();
    const idx = accounts.findIndex(a => a.id === s.accountId);
    if (idx === -1) return res.status(404).json({ message: 'Account not found' });
    const { displayName, position, bio } = req.body;
    if (displayName !== undefined) accounts[idx].displayName = String(displayName).slice(0, 80).trim();
    if (position !== undefined) accounts[idx].position = String(position).slice(0, 100).trim();
    if (bio !== undefined) accounts[idx].bio = String(bio).slice(0, 500).trim();
    accounts[idx].updatedAt = new Date().toISOString();
    writeStaffAccounts(accounts);
    const { passwordHash, ...safe } = accounts[idx];
    logAudit('account.profile_update', req, { accountId: s.accountId });
    res.json({ message: 'Profile updated', account: safe });
});

app.put('/api/admin/me/password', (req, res) => {
    const s = getSession(req.headers['x-admin-token']);
    if (!s) return res.status(401).json({ message: 'Unauthorised' });
    if (s.accountId === 'master') return res.status(400).json({ message: 'Use ADMIN_PASSWORD_HASH env var to change master password' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'currentPassword and newPassword required' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });
    if (newPassword.length > 128) return res.status(400).json({ message: 'Password too long' });
    const accounts = readStaffAccounts();
    const idx = accounts.findIndex(a => a.id === s.accountId);
    if (idx === -1) return res.status(404).json({ message: 'Account not found' });
    if (hashPassword(currentPassword) !== accounts[idx].passwordHash) return res.status(401).json({ message: 'Current password is incorrect' });
    accounts[idx].passwordHash = hashPassword(newPassword);
    accounts[idx].updatedAt = new Date().toISOString();
    writeStaffAccounts(accounts);
    // Invalidate all other sessions for this account
    for (const [t, sess] of adminSessions.entries()) {
        if (sess.accountId === accounts[idx].id && t !== req.headers['x-admin-token']) adminSessions.delete(t);
    }
    logAudit('account.password_change', req, { accountId: s.accountId });
    res.json({ message: 'Password changed successfully' });
});

app.post('/api/admin/me/avatar', (req, res) => {
    const s = getSession(req.headers['x-admin-token']);
    if (!s) return res.status(401).json({ message: 'Unauthorised' });
    upload.single('avatar')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const avatarUrl = `/uploads/${req.file.filename}`;
        if (s.accountId !== 'master') {
            const accounts = readStaffAccounts();
            const idx = accounts.findIndex(a => a.id === s.accountId);
            if (idx !== -1) {
                accounts[idx].avatar = avatarUrl;
                accounts[idx].updatedAt = new Date().toISOString();
                writeStaffAccounts(accounts);
            }
        }
        logAudit('account.avatar_upload', req, { accountId: s.accountId });
        res.json({ url: avatarUrl });
    });
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

app.patch('/api/admin/contacts/bulk/read', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (!ids.length) return res.status(400).json({ message: 'No ids provided' });
    const contacts = readContacts();
    const idSet = new Set(ids);
    let updated = 0;
    for (const c of contacts) {
        if (idSet.has(c.id) && !c.read) {
            c.read = true;
            updated++;
        }
    }
    writeContacts(contacts);
    res.json({ message: 'Updated', updated });
});

app.post('/api/admin/contacts/bulk/delete', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (!ids.length) return res.status(400).json({ message: 'No ids provided' });
    const idSet = new Set(ids);
    const contacts = readContacts();
    const filtered = contacts.filter(c => !idSet.has(c.id));
    writeContacts(filtered);
    res.json({ message: 'Deleted', deleted: contacts.length - filtered.length });
});

app.get('/api/admin/contacts/export.csv', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const contacts = readContacts().map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        subject: c.subject,
        message: c.message,
        read: c.read,
        createdAt: c.createdAt
    }));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    res.send(toCsv(contacts));
});

app.delete('/api/admin/contacts/:id', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    writeContacts(readContacts().filter(c => c.id !== req.params.id));
    logAudit('contacts.delete', req, { id: req.params.id });
    res.json({ message: 'Deleted' });
});

// ============================================================
// APPLICATIONS
// ============================================================

app.post('/api/apply', (req, res) => {
    try {
        const { position, name, email, discord, portfolio, experience, answers, referral } = req.body;
        if (!position || !name || !email || !experience) return res.status(400).json({ message: 'Required fields missing' });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email' });
        const applications = readApplications();
        applications.unshift({ id: randomBytes(8).toString('hex'), position: position.slice(0,200), name: name.slice(0,200), email: email.slice(0,200), discord: (discord||'').slice(0,200), portfolio: (portfolio||'').slice(0,500), experience: experience.slice(0,5000), answers: Array.isArray(answers) ? answers.slice(0,20) : [], referral: (referral || '').slice(0,120), notes: '', status: 'new', read: false, createdAt: new Date().toISOString() });
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
    logAudit('applications.status', req, { id: req.params.id, status: apps[idx].status });
    res.json({ application: apps[idx] });
});

app.patch('/api/admin/applications/:id/notes', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const apps = readApplications();
    const idx = apps.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    apps[idx].notes = (req.body.notes || '').slice(0, 5000);
    writeApplications(apps);
    logAudit('applications.notes', req, { id: req.params.id });
    res.json({ application: apps[idx] });
});

app.post('/api/admin/applications/bulk/delete', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (!ids.length) return res.status(400).json({ message: 'No ids provided' });
    const idSet = new Set(ids);
    const apps = readApplications();
    const filtered = apps.filter(a => !idSet.has(a.id));
    writeApplications(filtered);
    res.json({ message: 'Deleted', deleted: apps.length - filtered.length });
});

app.patch('/api/admin/applications/bulk/read', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (!ids.length) return res.status(400).json({ message: 'No ids provided' });
    const apps = readApplications();
    const idSet = new Set(ids);
    let updated = 0;
    for (const a of apps) {
        if (idSet.has(a.id) && !a.read) {
            a.read = true;
            updated++;
        }
    }
    writeApplications(apps);
    res.json({ message: 'Updated', updated });
});

app.get('/api/admin/applications/export.csv', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const apps = readApplications().map(a => ({
        id: a.id,
        position: a.position,
        name: a.name,
        email: a.email,
        discord: a.discord || '',
        portfolio: a.portfolio || '',
        referral: a.referral || '',
        status: a.status || 'new',
        read: a.read,
        notes: a.notes || '',
        createdAt: a.createdAt,
        experience: a.experience,
        answers: (a.answers || []).map(x => `${x.question}: ${x.answer || ''}`).join(' | ')
    }));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="applications.csv"');
    res.send(toCsv(apps));
});

app.delete('/api/admin/applications/:id', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    writeApplications(readApplications().filter(a => a.id !== req.params.id));
    logAudit('applications.delete', req, { id: req.params.id });
    res.json({ message: 'Deleted' });
});


app.get('/api/site-settings', (req, res) => {
    res.json({ settings: readSiteSettings() });
});

app.get('/api/admin/site-settings', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    res.json({ settings: readSiteSettings() });
});

app.put('/api/admin/site-settings', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const current = readSiteSettings();
    const incoming = req.body || {};
    const next = {
        ...current,
        ...incoming,
        announcement: {
            ...current.announcement,
            ...((incoming.announcement || {}))
        }
    };
    if (typeof next.announcement.text === 'string') next.announcement.text = next.announcement.text.slice(0, 240);
    if (typeof next.announcement.link === 'string') next.announcement.link = next.announcement.link.slice(0, 500);
    writeSiteSettings(next);
    logAudit('site-settings.update', req, { announcementEnabled: !!next.announcement.enabled });
    res.json({ settings: next });
});

app.get('/api/admin/analytics', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    const contacts = readContacts();
    const apps = readApplications();
    const views = readPageViews();

    const byDay = new Map();
    const bump = (iso, key) => {
        const d = (iso || '').slice(0, 10);
        if (!d) return;
        if (!byDay.has(d)) byDay.set(d, { date: d, views: 0, contacts: 0, applications: 0 });
        byDay.get(d)[key]++;
    };

    views.forEach(v => bump(v.at, 'views'));
    contacts.forEach(c => bump(c.createdAt, 'contacts'));
    apps.forEach(a => bump(a.createdAt, 'applications'));

    const trend = [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
    const busiest = trend.reduce((m, x) => (x.views > (m?.views || -1) ? x : m), null);

    res.json({
        totals: {
            pageViews: views.length,
            contacts: contacts.length,
            applications: apps.length,
            unreadMessages: contacts.filter(c => !c.read).length,
            unreadApplications: apps.filter(a => !a.read).length
        },
        trend,
        busiestDay: busiest
    });
});

app.get('/api/admin/audit-log', (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    res.json({ entries: readAuditLog() });
});

app.get('/api/admin/sessions', (req, res) => {
    const session = getSession(req.headers['x-admin-token']);
    if (!session) return res.status(401).json({ message: 'Unauthorised' });
    if (session.role !== 'superadmin') return res.status(403).json({ message: 'Forbidden' });
    const now = Date.now();
    const sessions = [...adminSessions.entries()].map(([token, s]) => ({
        token,
        role: s.role,
        accountId: s.accountId,
        expiresAt: s.expiresAt,
        remainingMs: Math.max(0, s.expiresAt - now)
    }));
    res.json({ sessions });
});

app.delete('/api/admin/sessions/:token', (req, res) => {
    const session = getSession(req.headers['x-admin-token']);
    if (!session) return res.status(401).json({ message: 'Unauthorised' });
    if (session.role !== 'superadmin') return res.status(403).json({ message: 'Forbidden' });
    const token = req.params.token;
    const existed = adminSessions.delete(token);
    if (!existed) return res.status(404).json({ message: 'Session not found' });
    logAudit('admin.session.kill', req, { token });
    res.json({ message: 'Session terminated' });
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
                    return {
                        ...game,
                        universeId: uid,
                        visits: stats.visits,
                        playing: stats.playing,
                        name: game.name || stats.name,
                        description: game.description || stats.description
                    };
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
    const { placeId, featured, active, thumbnail, name, description } = req.body;
    try {
        const games = await loadGames();
        const g = { id: randomBytes(8).toString('hex'), placeId: String(placeId||''), universeId: '', thumbnail: thumbnail||'', name: name||'', description: description||'', featured: featured||false, active: active!==false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        games.unshift(g);
        await fs.writeFile(path.join(DATA_ROOT, 'games-data.json'), JSON.stringify({ games }, null, 2));
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
        await fs.writeFile(path.join(DATA_ROOT, 'games-data.json'), JSON.stringify({ games }, null, 2));
        res.json({ message: 'Updated', game: games[i] });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

app.delete('/api/admin/games/:id', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    try {
        const games = await loadGames();
        const filtered = games.filter(g => g.id !== req.params.id);
        if (filtered.length === games.length) return res.status(404).json({ message: 'Not found' });
        await fs.writeFile(path.join(DATA_ROOT, 'games-data.json'), JSON.stringify({ games: filtered }, null, 2));
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
    const s = getSession(req.headers['x-admin-token']);
    if (!s) return res.status(401).json({ message: 'Unauthorised' });
    const { title, content, published, author, image } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    try {
        // Build author snapshot from session
        let authorSnapshot = { authorName: author || '', authorId: s.accountId, authorAvatar: '', authorPosition: '' };
        if (s.accountId !== 'master') {
            const accounts = readStaffAccounts();
            const acc = accounts.find(a => a.id === s.accountId);
            if (acc) { authorSnapshot = { authorName: acc.displayName || acc.username, authorId: acc.id, authorAvatar: acc.avatar || '', authorPosition: acc.position || '' }; }
        } else if (!author) { authorSnapshot.authorName = 'Switch Team'; }
        const posts = await loadBlogPosts();
        const p = { id: randomBytes(8).toString('hex'), title, content: content||'', published: published||false, image: image||'', ...authorSnapshot, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        posts.unshift(p);
        await fs.writeFile(path.join(DATA_ROOT, 'blog-posts.json'), JSON.stringify({ posts }, null, 2));
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
        await fs.writeFile(path.join(DATA_ROOT, 'blog-posts.json'), JSON.stringify({ posts }, null, 2));
        res.json({ message: 'Updated', post: posts[i] });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

app.delete('/api/admin/posts/:id', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    try {
        const posts = await loadBlogPosts();
        const filtered = posts.filter(p => p.id !== req.params.id);
        if (filtered.length === posts.length) return res.status(404).json({ message: 'Not found' });
        await fs.writeFile(path.join(DATA_ROOT, 'blog-posts.json'), JSON.stringify({ posts: filtered }, null, 2));
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
        await fs.writeFile(path.join(DATA_ROOT, 'careers-data.json'), JSON.stringify({ careers }, null, 2));
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
        await fs.writeFile(path.join(DATA_ROOT, 'careers-data.json'), JSON.stringify({ careers }, null, 2));
        res.json({ message: 'Updated', career: careers[i] });
    } catch { res.status(500).json({ message: 'Failed' }); }
});

app.delete('/api/admin/careers/:id', async (req, res) => {
    if (!isValidToken(req.headers['x-admin-token'])) return res.status(401).json({ message: 'Unauthorised' });
    try {
        const careers = await loadCareers();
        const filtered = careers.filter(c => c.id !== req.params.id);
        if (filtered.length === careers.length) return res.status(404).json({ message: 'Not found' });
        await fs.writeFile(path.join(DATA_ROOT, 'careers-data.json'), JSON.stringify({ careers: filtered }, null, 2));
        res.json({ message: 'Deleted' });
    } catch { res.status(500).json({ message: 'Failed' }); }
});


app.get('/', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));

app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.includes('.')) return next();
    const htmlPath = path.join(ROOT, req.path + '.html');
    fs.access(htmlPath).then(() => res.sendFile(htmlPath)).catch(() => next());
});

// 404 fallback
app.use((req, res) => {
    const p404 = path.join(ROOT, '404.html');
    fs.access(p404)
        .then(() => res.status(404).sendFile(p404))
        .catch(() => res.status(404).send('404 — Not Found'));
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${ROOT}`);
});