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
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
app.use(cors());
app.use(express.json());
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
// STATS
// ============================================================

app.get('/api/get-total-visits', (req, res) => {
    res.status(200).json({ message: "Successfully grabbed total visits", value: serverData.currentVisits });
});

app.get('/api/get-total-ccu', (req, res) => {
    res.status(200).json({ message: "Successfully grabbed total ccu", value: serverData.currentCCU });
});

// ============================================================
// CONTACT
// ============================================================

const CONTACTS_FILE = "./contacts.json";
function readContacts() {
    try { return JSON.parse(readFileSync(CONTACTS_FILE, "utf-8")).contacts; } catch { return []; }
}
function writeContacts(contacts) {
    writeFileSync(CONTACTS_FILE, JSON.stringify({ contacts }, null, 2), "utf-8");
}

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) return res.status(400).json({ message: "All fields are required" });

        // Save to file
        const contacts = readContacts();
        const newContact = {
            id: randomBytes(8).toString("hex"),
            name, email, subject, message,
            read: false,
            createdAt: new Date().toISOString()
        };
        contacts.unshift(newContact);
        writeContacts(contacts);

        // Send to Discord (optional — won't fail the request if it errors)
        if (DISCORD_WEBHOOK_URL) {
            try {
                const discordPayload = {
                    embeds: [{
                        title: "📧 New Contact Form Submission", color: 65535,
                        fields: [
                            { name: "Name", value: name, inline: true },
                            { name: "Email", value: email, inline: true },
                            { name: "Subject", value: subject, inline: false },
                            { name: "Message", value: message.length > 1024 ? message.substring(0, 1021) + "..." : message, inline: false }
                        ],
                        timestamp: new Date().toISOString(), footer: { text: "Switch Games Contact Form" }
                    }]
                };
                await fetch(DISCORD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(discordPayload) });
            } catch (webhookErr) { console.error('Discord webhook error:', webhookErr); }
        }

        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ message: "Failed to send message" });
    }
});

// Admin — read all contacts
app.get("/api/admin/contacts", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    res.status(200).json({ contacts: readContacts() });
});

// Admin — mark as read
app.patch("/api/admin/contacts/:id/read", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const contacts = readContacts();
    const idx = contacts.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Not found" });
    contacts[idx].read = true;
    writeContacts(contacts);
    res.status(200).json({ message: "Marked as read", contact: contacts[idx] });
});

// Admin — delete contact
app.delete("/api/admin/contacts/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const contacts = readContacts();
    const filtered = contacts.filter(c => c.id !== req.params.id);
    if (filtered.length === contacts.length) return res.status(404).json({ message: "Not found" });
    writeContacts(filtered);
    res.status(200).json({ message: "Deleted" });
});

// ============================================================
// JOB APPLICATIONS
// ============================================================

const APPLICATIONS_FILE = "./applications.json";
function readApplications() {
    try { return JSON.parse(readFileSync(APPLICATIONS_FILE, "utf-8")).applications; } catch { return []; }
}
function writeApplications(applications) {
    writeFileSync(APPLICATIONS_FILE, JSON.stringify({ applications }, null, 2), "utf-8");
}

app.post('/api/apply', async (req, res) => {
    try {
        const { position, name, email, discord, portfolio, experience, answers } = req.body;
        if (!position || !name || !email || !experience) return res.status(400).json({ message: "Required fields are missing" });

        // Save to file
        const applications = readApplications();
        const newApp = {
            id: randomBytes(8).toString("hex"),
            position, name, email,
            discord: discord || "",
            portfolio: portfolio || "",
            experience,
            answers: answers || [],
            status: "new",
            read: false,
            createdAt: new Date().toISOString()
        };
        applications.unshift(newApp);
        writeApplications(applications);

        // Send to Discord (optional — won't fail the request if it errors)
        if (DISCORD_WEBHOOK_URL) {
            try {
                const fields = [
                    { name: "Position", value: position, inline: false },
                    { name: "Name", value: name, inline: true },
                    { name: "Email", value: email, inline: true },
                    { name: "Discord", value: discord || "Not provided", inline: true },
                    { name: "Portfolio", value: portfolio || "Not provided", inline: false },
                    { name: "Experience & Why They're a Good Fit", value: experience.length > 1024 ? experience.substring(0, 1021) + "..." : experience, inline: false }
                ];
                if (answers && Array.isArray(answers)) {
                    answers.forEach(a => {
                        if (a.question && a.answer) fields.push({ name: a.question, value: a.answer.length > 1024 ? a.answer.substring(0, 1021) + "..." : a.answer, inline: false });
                    });
                }
                const discordPayload = { embeds: [{ title: "💼 New Job Application", color: 3447003, fields, timestamp: new Date().toISOString(), footer: { text: "Switch Games Job Application" } }] };
                await fetch(DISCORD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(discordPayload) });
            } catch (webhookErr) { console.error('Discord webhook error:', webhookErr); }
        }

        res.status(200).json({ message: "Application submitted successfully" });
    } catch (error) {
        console.error('Application form error:', error);
        res.status(500).json({ message: "Failed to submit application" });
    }
});

// Admin — read all applications
app.get("/api/admin/applications", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    res.status(200).json({ applications: readApplications() });
});

// Admin — update application status
app.patch("/api/admin/applications/:id/status", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const applications = readApplications();
    const idx = applications.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Not found" });
    if (req.body.status) applications[idx].status = req.body.status;
    applications[idx].read = true;
    writeApplications(applications);
    res.status(200).json({ message: "Updated", application: applications[idx] });
});

// Admin — delete application
app.delete("/api/admin/applications/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const applications = readApplications();
    const filtered = applications.filter(a => a.id !== req.params.id);
    if (filtered.length === applications.length) return res.status(404).json({ message: "Not found" });
    writeApplications(filtered);
    res.status(200).json({ message: "Deleted" });
});

// ============================================================
// ADMIN AUTH
// ============================================================

const ADMIN_PASSWORD_HASH = "25041dace945e0a85a78c93c681456626b017391ba108bf29bebde1704c85672"; // SwitchAdmin2025
const adminSessions = new Map();

function hashPassword(p) { return createHash("sha256").update(p).digest("hex"); }
function generateToken() { return randomBytes(32).toString("hex"); }
function isValidToken(token) {
    const session = adminSessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expiresAt) { adminSessions.delete(token); return false; }
    return true;
}

app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password required" });
    if (hashPassword(password) !== ADMIN_PASSWORD_HASH) return res.status(401).json({ message: "Invalid password" });
    const token = generateToken();
    adminSessions.set(token, { expiresAt: Date.now() + 1000 * 60 * 60 * 8 });
    res.status(200).json({ message: "Login successful", token });
});

app.post("/api/admin/logout", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (token) adminSessions.delete(token);
    res.status(200).json({ message: "Logged out" });
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

function readPosts() {
    try { return JSON.parse(readFileSync(BLOG_FILE, "utf-8")).posts; } catch { return []; }
}
function writePosts(posts) {
    writeFileSync(BLOG_FILE, JSON.stringify({ posts }, null, 2), "utf-8");
}

app.get("/api/blog/posts", (req, res) => {
    res.status(200).json({ posts: readPosts().filter(p => p.published) });
});

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
    posts.unshift(newPost);
    writePosts(posts);
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
    res.status(200).json({ message: "Post updated", post: posts[index] });
});

app.delete("/api/admin/posts/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const posts = readPosts();
    const filtered = posts.filter(p => p.id !== req.params.id);
    if (filtered.length === posts.length) return res.status(404).json({ message: "Post not found" });
    writePosts(filtered);
    res.status(200).json({ message: "Post deleted" });
});

// ============================================================
// CAREERS
// ============================================================

const CAREERS_FILE = "./careers-data.json";

function readCareers() {
    try { return JSON.parse(readFileSync(CAREERS_FILE, "utf-8")).careers; } catch { return []; }
}
function writeCareers(careers) {
    writeFileSync(CAREERS_FILE, JSON.stringify({ careers }, null, 2), "utf-8");
}

app.get("/api/careers", (req, res) => {
    res.status(200).json({ careers: readCareers().filter(c => c.active) });
});

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
    const newCareer = {
        id: randomBytes(8).toString("hex"), title,
        department: department || "", type: type || "Full-time",
        location: location || "Remote", description: description || "",
        requirements: requirements || [], niceToHave: niceToHave || [],
        questions: questions || [], active,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    careers.unshift(newCareer);
    writeCareers(careers);
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
    res.status(200).json({ message: "Career updated", career: careers[index] });
});

app.delete("/api/admin/careers/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const careers = readCareers();
    const filtered = careers.filter(c => c.id !== req.params.id);
    if (filtered.length === careers.length) return res.status(404).json({ message: "Career not found" });
    writeCareers(filtered);
    res.status(200).json({ message: "Career deleted" });
});

// ============================================================
// GAMES
// ============================================================

const GAMES_FILE = "./games-data.json";

function readGames() {
    try { return JSON.parse(readFileSync(GAMES_FILE, "utf-8")).games; } catch { return []; }
}
function writeGames(games) {
    writeFileSync(GAMES_FILE, JSON.stringify({ games }, null, 2), "utf-8");
}

// Public - active games with live stats
app.get("/api/games", async (req, res) => {
    try {
        const games = readGames().filter(g => g.active);
        const enriched = await Promise.all(games.map(async (game) => {
            try {
                // If we don't have universeId, fetch it from placeId
                let universeId = game.universeId;
                if (!universeId && game.placeId) {
                    const placeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${game.placeId}/universe`);
                    const placeData = await placeRes.json();
                    universeId = placeData.universeId?.toString();
                }
                
                if (universeId) {
                    const robloxRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
                    const robloxData = await robloxRes.json();
                    if (robloxData.data && robloxData.data[0]) {
                        const gameData = robloxData.data[0];
                        return {
                            ...game,
                            universeId,
                            placeId: game.placeId || gameData.rootPlaceId?.toString(),
                            name: gameData.name,
                            visits: gameData.visits,
                            playing: gameData.playing,
                            likes: gameData.favoritedCount,
                            maxPlayers: gameData.maxPlayers,
                            created: gameData.created,
                            updated: gameData.updated
                        };
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch data for ${game.placeId || game.universeId}:`, err);
            }
            return game;
        }));
        res.status(200).json({ games: enriched });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch games" });
    }
});

// Admin - all games
app.get("/api/admin/games", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    res.status(200).json({ games: readGames() });
});

// Create
app.post("/api/admin/games", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const { placeId, featured, active = true, thumbnail } = req.body;
    const games = readGames();
    const newGame = {
        id: randomBytes(8).toString("hex"),
        placeId: String(placeId || ""),
        universeId: "",
        thumbnail: thumbnail || "",
        featured: featured || false,
        active,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    games.unshift(newGame);
    writeGames(games);
    res.status(201).json({ message: "Game created", game: newGame });
});

// Update
app.put("/api/admin/games/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const games = readGames();
    const index = games.findIndex(g => g.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Game not found" });
    games[index] = { ...games[index], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
    writeGames(games);
    res.status(200).json({ message: "Game updated", game: games[index] });
});

// Delete
app.delete("/api/admin/games/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });
    const games = readGames();
    const filtered = games.filter(g => g.id !== req.params.id);
    if (filtered.length === games.length) return res.status(404).json({ message: "Game not found" });
    writeGames(filtered);
    res.status(200).json({ message: "Game deleted" });
});

// ============================================================
// 404 CATCH-ALL
// ============================================================

app.use((req, res) => {
    res.status(404).sendFile('404.html', { root: '.' });
});

// ============================================================

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});