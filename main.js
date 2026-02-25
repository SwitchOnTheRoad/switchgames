import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getGameStats } from './getData.js';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

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