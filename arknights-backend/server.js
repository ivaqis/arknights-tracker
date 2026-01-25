const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { URL, URLSearchParams } = require('url');
const BANNERS = require('./banners.js');

const app = express();
let prisma;
try {
    prisma = new PrismaClient();
} catch (e) {
    console.warn("Prisma Client not initialized.");
}

const PORT = 3001;

function generatePullId(uid, pull) {
    return `${uid}_${pull.seqId || pull.timestamp}`;
}

app.use(cors());
app.use(express.json());

const GAME_API_URL = 'https://ef-webview.gryphline.com/api/record/char';

const POOL_TYPES = [
    "E_CharacterGachaPoolType_Beginner",
    "E_CharacterGachaPoolType_Standard",
    "E_CharacterGachaPoolType_Special"
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

app.post('/api/import', async (req, res) => {
    const { rawUrl, saveStats } = req.body;
    const startTime = Date.now();
    const parsedUrl = new URL(rawUrl);
    if (!parsedUrl.hostname.endsWith('hg-game.com') && !parsedUrl.hostname.endsWith('gryphline.com')) {
         return res.status(400).json({ error: "Invalid domain" });
    }

    try {
        const parsedUrl = new URL(rawUrl);
        const token = parsedUrl.searchParams.get('token');
        const lang = parsedUrl.searchParams.get('lang') || 'en-us';
        const serverId = parsedUrl.searchParams.get('server_id') || '3';

        if (!token) return res.status(400).json({ error: "No token found" });

        console.log(`\n--- New Import Request ---`);

        let allPulls = [];
        const visitedIds = new Set();

        for (const poolType of POOL_TYPES) {
            let hasMore = true;
            let lastId = "";
            let pageCount = 1;

            console.log(`\n[Pool] Scanning: ${mapPoolTypeToShort(poolType)}`);

            while (hasMore) {
                const params = new URLSearchParams({
                    token, lang, server_id: serverId, pool_type: poolType
                });

                if (lastId) {
                    params.append('seq_id', lastId);
                }

                try {
                    const response = await axios.get(`${GAME_API_URL}?${params.toString()}`, {
                        timeout: 5000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'application/json'
                        }
                    });

                    const result = response.data;
                    if (result.code !== 0) break;

                    const list = result.data?.list || [];

                    const newItems = list.filter(item => !visitedIds.has(item.seqId));

                    if (list.length > 0 && newItems.length === 0) {
                        console.warn(`  -> Page ${pageCount}: All items are duplicates. Stopping.`);
                        hasMore = false;
                        break;
                    }

                    console.log(`  -> Page ${pageCount}: Received ${list.length} items. New: ${newItems.length}`);

                    newItems.forEach(item => visitedIds.add(item.seqId));

                    const listWithMeta = newItems.map(item => ({
                        ...item,
                        poolId: mapPoolTypeToShort(poolType)
                    }));

                    allPulls = [...allPulls, ...listWithMeta];
                    hasMore = result.data?.hasMore;

                    if (newItems.length === 0) {
                        hasMore = false;
                    }
                    else if (list.length > 0) {
                        lastId = list[list.length - 1].seqId;
                    } else {
                        hasMore = false;
                    }

                    pageCount++;
                    if (pageCount > 50) hasMore = false;
                    await sleep(100);

                } catch (err) {
                    console.error(`  -> Network/API Error on page ${pageCount}: ${err.message}`);
                    hasMore = false;
                }
            }
        }

        const pseudoUid = "u_" + token.substring(0, 15);

        console.log(`\n--- Import Finished ---`);
        console.log(`Total unique pulls: ${allPulls.length}`);

        if (saveStats && prisma && allPulls.length > 0) {
            const pseudoUid = "u_" + token.substring(0, 15);
            updateGlobalStatsBatch(pseudoUid, allPulls)
                .catch(e => console.error("Stats update failed:", e.message));
        }

        res.json({
            code: 0,
            data: {
                list: allPulls,
                uid: pseudoUid
            }
        });

    } catch (error) {
        console.error("Critical Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

function mapPoolTypeToShort(longType) {
    if (longType.includes('Beginner')) return 'new-player';
    if (longType.includes('Standard')) return 'standard';
    if (longType.includes('Special')) return 'special';
    return 'unknown';
}

async function updateGlobalStatsBatch(uid, allPulls) {
    if (!prisma) return;

    try {
        await prisma.user.upsert({ where: { uid }, update: {}, create: { uid } });

        const pullsToInsert = allPulls.map(p => {
            const pullTimeMs = p.timestamp * 1000; 
            
            const matchedBanner = BANNERS.find(b => 
                b.type === p.poolId && 
                pullTimeMs >= b.startTime &&
                (!b.endTime || pullTimeMs <= b.endTime)
            );

            const realBannerId = matchedBanner ? matchedBanner.id : p.poolId;

            return {
                id: generatePullId(uid, p),
                uid: uid,
                name: p.name,
                rarity: p.rarity,
                time: new Date(pullTimeMs),
                poolId: p.poolId, 
                bannerId: realBannerId,
                pity: 0, 
                isGuaranteed: false 
            };
        });

        for (const pull of pullsToInsert) {
            await prisma.pull.upsert({
                where: { id: pull.id },
                update: {}, 
                create: pull
            });
        }
        
        console.log(`[DB] Saved ${pullsToInsert.length} pulls for ${uid}`);

    } catch (e) {
        console.error("DB Update Error:", e.message);
    }
}

app.get('/api/rankings/data', async (req, res) => {
    try {
        const { bannerId } = req.query;

        if (!bannerId) {
            return res.status(400).json({ code: 1, message: "Banner ID is required" });
        }

        const totalPulls = await prisma.pull.count({
            where: { bannerId: bannerId }
        });

        const uniqueUsersGroup = await prisma.pull.groupBy({
            by: ['uid'],
            where: { bannerId: bannerId },
        });
        const totalUsers = uniqueUsersGroup.length;

        const rarityStats = await prisma.pull.groupBy({
            by: ['rarity'],
            where: { bannerId: bannerId },
            _count: { rarity: true }
        });

        const getCount = (r) => {
            const found = rarityStats.find(item => item.rarity === r);
            return found && found._count ? found._count.rarity : 0;
        };

        const count6 = getCount(6);
        const count5 = getCount(5);

        const pulls6 = await prisma.pull.findMany({
            where: { bannerId: bannerId, rarity: 6 },
            select: { pity: true, name: true }
        });

        const pities = pulls6.map(p => p.pity).sort((a, b) => a - b);
        let median6 = 0;
        if (pities.length > 0) {
            const mid = Math.floor(pities.length / 2);
            median6 = pities.length % 2 !== 0 ? pities[mid] : (pities[mid - 1] + pities[mid]) / 2;
        }

        const sixStarNames = {};
        pulls6.forEach(p => {
            sixStarNames[p.name] = (sixStarNames[p.name] || 0) + 1;
        });

        res.json({
            code: 0,
            data: {
                totalUsers,
                totalPulls,
                median6,
                count6,
                count5,
                sixStarNames
            }
        });

    } catch (e) {
        console.error("Global stats error:", e);
        res.status(500).json({ code: 500, message: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on ${PORT}`);
});