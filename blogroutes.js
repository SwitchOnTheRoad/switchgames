// ============================================================
// BLOG ROUTES — paste this into your server.js
// Add these imports at the top of server.js:
//
//   import { createHash, randomBytes } from "crypto";
//   import { readFileSync, writeFileSync } from "fs";
//
// ============================================================

const ADMIN_PASSWORD_HASH = "92566b61eb9f0568cc88f598ba75d8836e657de4e40d069ccc22ac62b5075fa0"; // SHA-256 of "SwitchGamesAdmin"
const BLOG_FILE = "./blog-posts.json";

// In-memory session tokens { token: expiresAt }
const adminSessions = new Map();

function hashPassword(password) {
    return createHash("sha256").update(password).digest("hex");
}

function generateToken() {
    return randomBytes(32).toString("hex");
}

function isValidToken(token) {
    const session = adminSessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
        adminSessions.delete(token);
        return false;
    }
    return true;
}

function readPosts() {
    try {
        const raw = readFileSync(BLOG_FILE, "utf-8");
        return JSON.parse(raw).posts;
    } catch {
        return [];
    }
}

function writePosts(posts) {
    writeFileSync(BLOG_FILE, JSON.stringify({ posts }, null, 2), "utf-8");
}

// --- Admin login ---
app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password required" });

    if (hashPassword(password) !== ADMIN_PASSWORD_HASH) {
        return res.status(401).json({ message: "Invalid password" });
    }

    const token = generateToken();
    adminSessions.set(token, { expiresAt: Date.now() + 1000 * 60 * 60 * 8 }); // 8hr session

    res.status(200).json({ message: "Login successful", token });
});

// --- Admin logout ---
app.post("/api/admin/logout", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (token) adminSessions.delete(token);
    res.status(200).json({ message: "Logged out" });
});

// --- Get all posts (public — only published ones) ---
app.get("/api/blog/posts", (req, res) => {
    const posts = readPosts().filter(p => p.published);
    res.status(200).json({ posts });
});

// --- Get all posts (admin — includes drafts) ---
app.get("/api/admin/posts", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });

    res.status(200).json({ posts: readPosts() });
});

// --- Create new post ---
app.post("/api/admin/posts", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });

    const { title, content, published = false } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and content required" });

    const posts = readPosts();
    const newPost = {
        id: randomBytes(8).toString("hex"),
        title,
        content,
        published,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    writePosts(posts);

    res.status(201).json({ message: "Post created", post: newPost });
});

// --- Update post ---
app.put("/api/admin/posts/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });

    const { id } = req.params;
    const { title, content, published } = req.body;

    const posts = readPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ message: "Post not found" });

    posts[index] = {
        ...posts[index],
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(published !== undefined && { published }),
        updatedAt: new Date().toISOString()
    };

    writePosts(posts);
    res.status(200).json({ message: "Post updated", post: posts[index] });
});

// --- Delete post ---
app.delete("/api/admin/posts/:id", (req, res) => {
    const token = req.headers["x-admin-token"];
    if (!isValidToken(token)) return res.status(401).json({ message: "Unauthorised" });

    const { id } = req.params;
    const posts = readPosts();
    const filtered = posts.filter(p => p.id !== id);

    if (filtered.length === posts.length) return res.status(404).json({ message: "Post not found" });

    writePosts(filtered);
    res.status(200).json({ message: "Post deleted" });
});