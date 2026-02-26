export async function getGameStats(universeId) {
    try {
        const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
        const data = await response.json();
        
        if (data.data && data.data[0]) {
            const game = data.data[0];
            return {
                visits: game.visits || 0,
                playing: game.playing || 0,
                likes: game.favoritedCount || 0,
                name: game.name || 'Unknown',
                description: game.description || '',
                maxPlayers: game.maxPlayers || 0,
                created: game.created || null,
                updated: game.updated || null
            };
        }
        
        return {
            visits: 0,
            playing: 0,
            likes: 0,
            name: 'Unknown',
            description: '',
            maxPlayers: 0,
            created: null,
            updated: null
        };
    } catch (error) {
        console.error('Error fetching game stats:', error);
        return {
            visits: 0,
            playing: 0,
            likes: 0,
            name: 'Unknown',
            description: '',
            maxPlayers: 0,
            created: null,
            updated: null
        };
    }
}