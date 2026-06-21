const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function test() {
  try {
    const placeId = 920587237; // Adopt Me
    const uRes = await get(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    console.log('Universe Res:', uRes);
    const universeId = uRes.universeId;

    const gRes = await get(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    console.log('Games Res:', JSON.stringify(gRes, null, 2));

    const vRes = await get(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`);
    console.log('Votes Res:', JSON.stringify(vRes, null, 2));

  } catch (err) {
    console.error(err);
  }
}

test();
