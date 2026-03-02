import express from "express";
import cors from "cors";
import { createHash, randomBytes } from "crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { extname } from "path";
import multer from "multer";
import { initUpdateData } from "./updateData.js";
import { serverData } from "./data.js";

initUpdateData();

if (!existsSync("./uploads")) mkdirSync("./uploads");

const PORT = process.env.PORT || 5500;
const app = express();

// ============================================================
// SECURITY HEADERS
// ============================================================
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
});

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static('.'));
app.use('/uploads', express.static('./uploads'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'),
    filename: (req, file, cb) => cb(null, `${randomBytes(8).toString("hex")}${extname(file.originalname)}`)
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) return cb(new Error("Only images allowed"));
        cb(null, true);
    }
});

// ============================================================
// BRUTE FORCE PROTECTION  (5 fails = 15 min lockout)
// ============================================================
const loginAttempts = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const e = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
    if (now < e.lockedUntil) return { allowed: false, remaining: Math.ceil((e.lockedUntil - now) / 1000) };
    return { allowed: true };
}
function recordFailedAttempt(ip) {
    const e = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
    e.count += 1;
    if (e.count >= 5) { e.lockedUntil = Date.now() + 15 * 60 * 1000; e.count = 0; }
    loginAttempts.set(ip, e);
}
function clearAttempts(ip) { loginAttempts.delete(ip); }
setInterval(() => {
    const now = Date.now();
    for (const [ip, e] of loginAttempts.entries()) {
        if (now > e.lockedUntil + 30 * 60 * 1000) loginAttempts.delete(ip);
    }
}, 30 * 60 * 1000);

// ============================================================
// AUDIT LOG
// ============================================================
const AUDIT_FILE = "./audit-log.json";
function readAudit() { try { return JSON.parse(readFileSync(AUDIT_FILE, "utf-8")).entries; } catch { return []; } }
function writeAudit(entries) { writeFileSync(AUDIT_FILE, JSON.stringify({ entries: entries.slice(0, 500) }, null, 2)); }
function logAudit(action, details = {}, ip = "unknown") {
    const entries = readAudit();
    entries.unshift({ id: randomBytes(4).toString("hex"), action, details, ip, timestamp: new Date().toISOString() });
    writeAudit(entries);
}

// ============================================================
// PAGE VIEWS TRACKING
// ============================================================
const PAGE_VIEWS_FILE = "./page-views.json";
function readPageViews() { try { return JSON.parse(readFileSync(PAGE_VIEWS_FILE, "utf-8")); } catch { return { total: 0, today: 0, lastReset: new Date().toDateString(), daily: [] }; } }
function writePageViews(data) { writeFileSync(PAGE_VIEWS_FILE, JSON.stringify(data, null, 2)); }

app.post("/api/pageview", (req, res) => {
    const data = readPageViews();
    const today = new Date().toDateString();
    if (data.lastReset !== today) {
        data.daily = [{ date: data.lastReset, views: data.today }, ...data.daily].slice(0, 30);
        data.today = 0; data.lastReset = today;
    }
    data.total += 1; data.today += 1;
    writePageViews(data);
    res.json({ ok: true });
});
app.get("/api/admin/pageviews", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    res.json(readPageViews());
});

// ============================================================
// SITE SETTINGS
// ============================================================
const SETTINGS_FILE = "./site-settings.json";
function readSettings() { try { return JSON.parse(readFileSync(SETTINGS_FILE, "utf-8")); } catch { return { announcement: { enabled: false, text: "", background: "#FBBF24", textColor: "#0A0A0A", link: "" } }; } }
function writeSettings(data) { writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2)); }

app.get("/api/settings", (req, res) => { res.json(readSettings()); });
app.put("/api/admin/settings", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const updated = { ...readSettings(), ...req.body };
    writeSettings(updated);
    logAudit("settings.updated", {}, req.ip);
    res.json({ message: "Settings updated", settings: updated });
});

// ============================================================
// STATS
// ============================================================
app.get('/api/get-total-visits', (req, res) => { res.status(200).json({ message: "Successfully grabbed total visits", value: serverData.currentVisits }); });
app.get('/api/get-total-ccu', (req, res) => { res.status(200).json({ message: "Successfully grabbed total ccu", value: serverData.currentCCU }); });

// ============================================================
// CONTACT
// ============================================================
const CONTACTS_FILE = "./contacts.json";
function readContacts() { try { return JSON.parse(readFileSync(CONTACTS_FILE, "utf-8")).contacts; } catch { return []; } }
function writeContacts(contacts) { writeFileSync(CONTACTS_FILE, JSON.stringify({ contacts }, null, 2), "utf-8"); }

app.post('/api/contact', (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) return res.status(400).json({ message: "All fields are required" });
        const contacts = readContacts();
        contacts.unshift({ id: randomBytes(8).toString("hex"), name, email, subject, message, read: false, createdAt: new Date().toISOString() });
        writeContacts(contacts);
        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) { console.error('Contact form error:', error); res.status(500).json({ message: "Failed to send message" }); }
});
app.get("/api/admin/contacts", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    res.status(200).json({ contacts: readContacts() });
});
app.patch("/api/admin/contacts/:id/read", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const contacts = readContacts();
    const idx = contacts.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Not found" });
    contacts[idx].read = true; writeContacts(contacts);
    res.status(200).json({ contact: contacts[idx] });
});
app.delete("/api/admin/contacts/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    writeContacts(readContacts().filter(c => c.id !== req.params.id));
    res.status(200).json({ message: "Deleted" });
});

// ============================================================
// APPLICATIONS
// ============================================================
const APPLICATIONS_FILE = "./applications.json";
function readApplications() { try { return JSON.parse(readFileSync(APPLICATIONS_FILE, "utf-8")).applications; } catch { return []; } }
function writeApplications(applications) { writeFileSync(APPLICATIONS_FILE, JSON.stringify({ applications }, null, 2), "utf-8"); }

app.post('/api/apply', (req, res) => {
    try {
        const { position, name, email, discord, portfolio, experience, answers } = req.body;
        if (!position || !name || !email || !experience) return res.status(400).json({ message: "Required fields are missing" });
        const applications = readApplications();
        applications.unshift({ id: randomBytes(8).toString("hex"), position, name, email, discord: discord || "", portfolio: portfolio || "", experience, answers: answers || [], status: "new", read: false, createdAt: new Date().toISOString() });
        writeApplications(applications);
        res.status(200).json({ message: "Application submitted successfully" });
    } catch (error) { console.error('Application form error:', error); res.status(500).json({ message: "Failed to submit application" }); }
});
app.get("/api/admin/applications", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    res.status(200).json({ applications: readApplications() });
});
app.patch("/api/admin/applications/:id/status", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const applications = readApplications();
    const idx = applications.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Not found" });
    const old = applications[idx].status;
    if (req.body.status) applications[idx].status = req.body.status;
    applications[idx].read = true; writeApplications(applications);
    logAudit("application.status_changed", { id: req.params.id, from: old, to: req.body.status }, req.ip);
    res.status(200).json({ application: applications[idx] });
});
app.delete("/api/admin/applications/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    writeApplications(readApplications().filter(a => a.id !== req.params.id));
    logAudit("application.deleted", { id: req.params.id }, req.ip);
    res.status(200).json({ message: "Deleted" });
});

// ============================================================
// ADMIN AUTH  ←  PASSWORD: SwitchGamesAdmin
// ============================================================
function hashPassword(p) { return createHash("sha256").update(p).digest("hex"); }

const ADMIN_PASSWORD = "SwitchGamesAdmin";
const adminSessions = new Map();

function generateToken() { return randomBytes(32).toString("hex"); }
function isValidToken(token) {
    if (!token) return false;
    const session = adminSessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expiresAt) { adminSessions.delete(token); return false; }
    session.expiresAt = Date.now() + 1000 * 60 * 60 * 8;
    session.lastActive = new Date().toISOString();
    return true;
}

app.post("/api/admin/login", (req, res) => {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const { password } = req.body;
    const rl = checkRateLimit(ip);
    if (!rl.allowed) {
        logAudit("login.blocked", { remaining: rl.remaining }, ip);
        return res.status(429).json({ message: `Too many failed attempts. Try again in ${Math.ceil(rl.remaining / 60)} minutes.`, locked: true });
    }
    if (!password) return res.status(400).json({ message: "Password required" });
    if (hashPassword(password) !== hashPassword(ADMIN_PASSWORD)) {
        recordFailedAttempt(ip);
        const entry = loginAttempts.get(ip) || { count: 0 };
        logAudit("login.failed", { ip }, ip);
        return res.status(401).json({ message: "Invalid password", attemptsLeft: Math.max(0, 5 - entry.count) });
    }
    clearAttempts(ip);
    const token = generateToken();
    adminSessions.set(token, { expiresAt: Date.now() + 1000 * 60 * 60 * 8, createdAt: new Date().toISOString(), lastActive: new Date().toISOString(), ip });
    logAudit("login.success", { ip }, ip);
    res.status(200).json({ message: "Login successful", token });
});

app.post("/api/admin/logout", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (token) { adminSessions.delete(token); logAudit("logout", {}, req.ip); }
    res.status(200).json({ message: "Logged out" });
});
app.get("/api/admin/sessions", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const sessions = [];
    for (const [t, s] of adminSessions.entries()) {
        sessions.push({ tokenPreview: t.slice(0, 8) + "...", ip: s.ip, createdAt: s.createdAt, lastActive: s.lastActive, current: t === token });
    }
    res.json({ sessions });
});
app.delete("/api/admin/sessions/all", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const current = adminSessions.get(token);
    adminSessions.clear();
    if (current) adminSessions.set(token, current);
    logAudit("sessions.revoked_all", {}, req.ip);
    res.json({ message: "All other sessions revoked" });
});
app.get("/api/admin/audit", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    res.json({ entries: readAudit() });
});

// ============================================================
// IMAGE UPLOAD
// ============================================================
app.post("/api/admin/upload", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    upload.single("image")(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        res.status(200).json({ url: `/uploads/${req.file.filename}` });
    });
});

// ============================================================
// BLOG
// ============================================================
const BLOG_FILE = "./blog-posts.json";
function readPosts() { try { return JSON.parse(readFileSync(BLOG_FILE, "utf-8")).posts; } catch { return []; } }
function writePosts(posts) { writeFileSync(BLOG_FILE, JSON.stringify({ posts }, null, 2), "utf-8"); }

app.get("/api/blog/posts", (req, res) => { res.status(200).json({ posts: readPosts().filter(p => p.published) }); });
app.get("/api/admin/posts", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    res.status(200).json({ posts: readPosts() });
});
app.post("/api/admin/posts", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const { title, content, published = false } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });
    const posts = readPosts();
    const newPost = { id: randomBytes(8).toString("hex"), title, content: content || "", published, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    posts.unshift(newPost); writePosts(posts);
    logAudit("post.created", { title }, req.ip);
    res.status(201).json({ message: "Post created", post: newPost });
});
app.put("/api/admin/posts/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const posts = readPosts();
    const index = posts.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Post not found" });
    const { title, content, published } = req.body;
    posts[index] = { ...posts[index], ...(title !== undefined && { title }), ...(content !== undefined && { content }), ...(published !== undefined && { published }), updatedAt: new Date().toISOString() };
    writePosts(posts);
    logAudit("post.updated", { id: req.params.id }, req.ip);
    res.status(200).json({ message: "Post updated", post: posts[index] });
});
app.delete("/api/admin/posts/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const posts = readPosts();
    const filtered = posts.filter(p => p.id !== req.params.id);
    if (filtered.length === posts.length) return res.status(404).json({ message: "Post not found" });
    writePosts(filtered);
    logAudit("post.deleted", { id: req.params.id }, req.ip);
    res.status(200).json({ message: "Post deleted" });
});

// ============================================================
// CAREERS
// ============================================================
const CAREERS_FILE = "./careers-data.json";
function readCareers() { try { return JSON.parse(readFileSync(CAREERS_FILE, "utf-8")).careers; } catch { return []; } }
function writeCareers(careers) { writeFileSync(CAREERS_FILE, JSON.stringify({ careers }, null, 2), "utf-8"); }

app.get("/api/careers", (req, res) => { res.status(200).json({ careers: readCareers().filter(c => c.active) }); });
app.get("/api/admin/careers", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    res.status(200).json({ careers: readCareers() });
});
app.post("/api/admin/careers", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const { title, department, type, location, description, requirements, niceToHave, questions, active = true } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });
    const careers = readCareers();
    const newCareer = { id: randomBytes(8).toString("hex"), title, department: department || "", type: type || "Full-time", location: location || "Remote", description: description || "", requirements: requirements || [], niceToHave: niceToHave || [], questions: questions || [], active, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    careers.unshift(newCareer); writeCareers(careers);
    logAudit("career.created", { title }, req.ip);
    res.status(201).json({ message: "Career created", career: newCareer });
});
app.put("/api/admin/careers/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const careers = readCareers();
    const index = careers.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Career not found" });
    careers[index] = { ...careers[index], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
    writeCareers(careers);
    logAudit("career.updated", { id: req.params.id }, req.ip);
    res.status(200).json({ message: "Career updated", career: careers[index] });
});
app.delete("/api/admin/careers/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const careers = readCareers();
    const filtered = careers.filter(c => c.id !== req.params.id);
    if (filtered.length === careers.length) return res.status(404).json({ message: "Career not found" });
    writeCareers(filtered);
    logAudit("career.deleted", { id: req.params.id }, req.ip);
    res.status(200).json({ message: "Career deleted" });
});

// ============================================================
// GAMES
// ============================================================
const GAMES_FILE = "./games-data.json";
function readGames() { try { return JSON.parse(readFileSync(GAMES_FILE, "utf-8")).games; } catch { return []; } }
function writeGames(games) { writeFileSync(GAMES_FILE, JSON.stringify({ games }, null, 2), "utf-8"); }

app.get("/api/games", async (req, res) => {
    try {
        const games = readGames().filter(g => g.active);
        const enriched = await Promise.all(games.map(async (game) => {
            try {
                let universeId = game.universeId;
                if (!universeId && game.placeId) {
                    const placeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${game.placeId}/universe`);
                    const placeData = await placeRes.json();
                    universeId = placeData.universeId?.toString();
                }
                if (universeId) {
                    const robloxRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
                    const robloxData = await robloxRes.json();
                    if (robloxData.data?.[0]) {
                        const g = robloxData.data[0];
                        return { ...game, universeId, placeId: game.placeId || g.rootPlaceId?.toString(), name: g.name, visits: g.visits, playing: g.playing, likes: g.favoritedCount, maxPlayers: g.maxPlayers };
                    }
                }
            } catch (err) { console.error(`Failed to fetch Roblox data for ${game.placeId}:`, err.message); }
            return game;
        }));
        res.status(200).json({ games: enriched });
    } catch (error) { res.status(500).json({ message: "Failed to fetch games" }); }
});
app.get("/api/admin/games", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    res.status(200).json({ games: readGames() });
});
app.post("/api/admin/games", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const { placeId, featured, active = true, thumbnail } = req.body;
    const games = readGames();
    const newGame = { id: randomBytes(8).toString("hex"), placeId: String(placeId || ""), universeId: "", thumbnail: thumbnail || "", featured: featured || false, active, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    games.unshift(newGame); writeGames(games);
    logAudit("game.created", { placeId }, req.ip);
    res.status(201).json({ message: "Game created", game: newGame });
});
app.put("/api/admin/games/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const games = readGames();
    const index = games.findIndex(g => g.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Game not found" });
    games[index] = { ...games[index], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
    writeGames(games);
    logAudit("game.updated", { id: req.params.id }, req.ip);
    res.status(200).json({ message: "Game updated", game: games[index] });
});
app.delete("/api/admin/games/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const games = readGames();
    const filtered = games.filter(g => g.id !== req.params.id);
    if (filtered.length === games.length) return res.status(404).json({ message: "Game not found" });
    writeGames(filtered);
    logAudit("game.deleted", { id: req.params.id }, req.ip);
    res.status(200).json({ message: "Game deleted" });
});

// ============================================================
// 404 CATCH-ALL
// ============================================================
app.use((req, res) => { res.status(404).sendFile('404.html', { root: '.' }); });

app.listen(PORT, () => {
    console.log(`\n✅ Server running at http://localhost:${PORT}`);
    console.log(`🔑 Admin password: SwitchGamesAdmin`);
    console.log(`🔒 Admin panel:    http://localhost:${PORT}/admin\n`);
});