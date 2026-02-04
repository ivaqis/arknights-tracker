const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { URL, URLSearchParams } = require('url');
const { BANNERS } = require('./banners');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const importLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута (в миллисекундах)
    max: 3,
    message: { 
        error: "Too many requests. Please wait a minute before trying again." 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

function generateStableUid(pulls) {
    if (!pulls || pulls.length === 0) return null;
    const itemWithUid = pulls.find(p => p.uid && p.uid !== "" && p.uid !== "0");
    if (itemWithUid) return itemWithUid.uid.toString();

    const sorted = [...pulls].sort((a, b) => a.timestamp - b.timestamp || Number(a.seqId || 0) - Number(b.seqId || 0));
    const fingerprintData = sorted.slice(0, 10).map(p => 
        `${p.timestamp}_${p.poolId}_${p.name}_${p.rarity}`
    ).join('|');
    return 'u_' + crypto.createHash('md5').update(fingerprintData).digest('hex');
}

const app = express();
app.set('trust proxy', 1);
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
app.use(express.json({ limit: '10mb' }));

const GAME_API_URL = 'https://ef-webview.gryphline.com/api/record/char';

const POOL_TYPES = [
    "E_CharacterGachaPoolType_Beginner",
    "E_CharacterGachaPoolType_Standard",
    "E_CharacterGachaPoolType_Special",
    "WEAPON_FETCH_ALL"
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchGameData(token, lang, serverId) {
    console.log(`\n--- Starting PARALLEL Scan on SERVER ID: ${serverId} ---`);

    const fetchPool = async (poolType) => {
        let poolPulls = [];
        const visitedIds = new Set();
        let hasMore = true;
        let lastId = "";
        let pageCount = 1;

        const isWeaponScan = poolType === 'WEAPON_FETCH_ALL';
        const currentApiUrl = isWeaponScan 
            ? 'https://ef-webview.gryphline.com/api/record/weapon'
            : 'https://ef-webview.gryphline.com/api/record/char';

        const poolLabel = isWeaponScan ? 'WEAPONS' : mapPoolTypeToShort(poolType);

        while (hasMore) {
            const params = new URLSearchParams({ token, lang, server_id: serverId });

            if (!isWeaponScan) {
                params.append('pool_type', poolType);
            }
            if (lastId) params.append('seq_id', lastId);

            try {
                const response = await axios.get(`${currentApiUrl}?${params.toString()}`, {
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'application/json'
                    }
                });

                const result = response.data;
                
                if (result.code !== 0) {
                    hasMore = false; 
                    break; 
                }

                const list = result.data?.list || [];
                
                const newItems = list.filter(item => {
                    const uniqueKey = (isWeaponScan ? 'w_' : 'c_') + item.seqId;
                    return !visitedIds.has(uniqueKey);
                });

                if (list.length > 0 && newItems.length === 0) {
                    hasMore = false;
                    break;
                }

                newItems.forEach(item => {
                    const uniqueKey = (isWeaponScan ? 'w_' : 'c_') + item.seqId;
                    visitedIds.add(uniqueKey);
                });

                const listWithMeta = newItems.map(item => {
                    let finalPoolId;
                    if (isWeaponScan) {
                        finalPoolId = item.poolId || item.bannerId; 
                    } else {
                        finalPoolId = mapPoolTypeToShort(poolType);
                    }

                    return {
                        ...item,
                        name: item.name || item.charName || item.weaponName, 
                        poolId: finalPoolId,
                        itemType: isWeaponScan ? 'weapon' : 'character'
                    };
                });

                poolPulls = [...poolPulls, ...listWithMeta];
                
                hasMore = result.data?.hasMore;
                if (newItems.length === 0) hasMore = false;
                else if (list.length > 0) lastId = list[list.length - 1].seqId;
                else hasMore = false;

                pageCount++;
                if (pageCount > 50) hasMore = false; 

                await sleep(50); 

            } catch (err) {
                console.error(`Error scanning ${poolLabel}: ${err.message}`);
                hasMore = false;
            }
        }
        return poolPulls;
    };

    try {
        const results = await Promise.all(POOL_TYPES.map(type => fetchPool(type)));
        
        const allPulls = results.flat();
        
        return allPulls;
    } catch (e) {
        console.error("Parallel fetch failed", e);
        return [];
    }
}

app.post('/api/import', importLimiter, async (req, res) => {
    const { rawUrl } = req.body;
    
    try {
        const parsedUrl = new URL(rawUrl);
        if (!parsedUrl.hostname.endsWith('hg-game.com') && !parsedUrl.hostname.endsWith('gryphline.com')) {
            return res.status(400).json({ error: "Invalid domain" });
        }
        
        const token = parsedUrl.searchParams.get('token') || parsedUrl.searchParams.get('u8_token');
        
        const lang = 'en-us'; 
        
        let targetServerId = parsedUrl.searchParams.get('server_id') || '3';

        if (!token) return res.status(400).json({ error: "No token found in URL" });

        console.log(`\n--- New Import Request ---`);

        let allPulls = await fetchGameData(token, lang, targetServerId);

        if (allPulls.length === 0 && targetServerId === '3') {
            console.log("\n⚠️ No data found on Server 3. Retrying on Server 2...");
            targetServerId = '2'; 
            allPulls = await fetchGameData(token, lang, targetServerId);
        }

        console.log(`--- Import Finished. Total: ${allPulls.length} ---`);

        if (allPulls.length === 0) {
            return res.status(400).json({ error: "No pulls found (checked servers 3 and 2)" });
        }

        const stableUid = generateStableUid(allPulls);

        if (!stableUid) {
            return res.status(400).json({ error: "Unable to generate UID from pulls" });
        }

        console.log(`User Stable UID: ${stableUid}`);

        if (prisma) {
            await updateAggregatedStats(stableUid, allPulls);
        }

        res.json({
            code: 0,
            data: {
                list: allPulls,
                uid: stableUid
            }
        });

    } catch (error) {
        console.error("Critical Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

function mapPoolTypeToShort(longType) {
    if (!longType) return 'unknown';
    if (longType.includes('Character')) {
        if (longType.includes('Beginner')) return 'new-player';
        if (longType.includes('Standard')) return 'standard';
        if (longType.includes('Special')) return 'special';
    }
    if (longType.includes('Beginner')) return 'new-player';
    if (longType.includes('Standard') && !longType.includes('Weapon')) return 'standard';
    if (longType.includes('Special') && !longType.includes('Weapon') && !longType.includes('weponbox')) return 'special';
    if (longType === 'WEAPON_FETCH_ALL') return 'weapon-all'; // Временный тип
    if (longType.includes('Weapon') && longType.includes('Standard')) return 'weap-standard';
    if (longType.includes('Weapon') && longType.includes('Special')) return 'weap-special';
    if (longType.includes('constant')) return 'weap-standard'; // weaponbox_constant_2
    if (longType.includes('weponbox')) return 'weap-special';  // weponbox_1_0_1

    return 'unknown';
}

async function updateAggregatedStats(uid, allPulls) {
    if (!allPulls.length) return;

    await prisma.user.upsert({ where: { uid }, update: {}, create: { uid } });

    const pullsByCategory = {};

    allPulls.forEach(p => {
        let pullTimeMs = 0;
        if (p.gachaTs) {
            pullTimeMs = Number(p.gachaTs);
        } else if (p.timestamp) {
            pullTimeMs = Number(p.timestamp) * 1000;
        } else if (p.ts) {
            pullTimeMs = Number(p.ts) * 1000;
        } else if (p.time) {
             pullTimeMs = new Date(p.time).getTime();
        }

        if (!pullTimeMs || isNaN(pullTimeMs)) {
            console.warn(`⚠️ Invalid timestamp for item ${p.name}. Using Date.now()`);
            pullTimeMs = Date.now();
        }

        const category = normalizeBannerId(p.poolId);
        
        if (!pullsByCategory[category]) pullsByCategory[category] = [];
        pullsByCategory[category].push({ ...p, time: pullTimeMs });
    });

    for (const [category, pulls] of Object.entries(pullsByCategory)) {
        const stats = calculateMath(pulls, category);

        await prisma.userBannerStat.upsert({
            where: { uid_bannerId: { uid, bannerId: category } },
            update: {
                totalPulls: stats.totalPulls,
                total6: stats.total6,
                sumPity6: stats.sumPity6,
                total5: stats.total5,
                sumPity5: stats.sumPity5,
                won5050: stats.won5050,
                total5050: stats.total5050,
                lastUpdate: new Date()
            },
            create: {
                uid,
                bannerId: category,
                totalPulls: stats.totalPulls,
                total6: stats.total6,
                sumPity6: stats.sumPity6,
                total5: stats.total5,
                sumPity5: stats.sumPity5,
                won5050: stats.won5050,
                total5050: stats.total5050
            }
        });
    }
    console.log(`[Stats] Updated for ${uid}: ${Object.keys(pullsByCategory).join(', ')}`);
}

function calculateMath(pulls, categoryId) {
    pulls.sort((a, b) => {
        const tA = Number(a.time); 
        const tB = Number(b.time);
        if (tA !== tB) return tA - tB;
        return Number(a.seqId || 0) - Number(b.seqId || 0);
    });

    const isWeapon = categoryId.includes('weap') || categoryId.includes('wepon');
    const hardPityLimit = isWeapon ? 80 : 120;

    let stats = {
        totalPulls: pulls.length,
        total6: 0, sumPity6: 0,
        total5: 0, sumPity5: 0,
        won5050: 0, total5050: 0
    };

    let currentPity6 = 0;
    let currentPity5 = 0;
    
    let rateUpCounter = 0; 

    pulls.forEach((pull) => {
        const isFree = pull.isFree === true || String(pull.isFree) === "true";
        const itemName = normalize(pull.name);

        let isHardPityTriggered = false;
        if (!isFree) {
            if (rateUpCounter >= hardPityLimit - 1) {
                isHardPityTriggered = true;
            }
            rateUpCounter++;
        }

        if (pull.rarity === 6) {
            stats.total6++;
            stats.sumPity6 += currentPity6 + (isFree ? 0 : 1);

            const matchedBanner = BANNERS.find(b => {
                const typeMatch = b.id === pull.poolId || normalizeBannerId(b.type) === categoryId;
                const timeMatch = true; 
                return typeMatch && timeMatch;
            });

            if (matchedBanner && matchedBanner.featured6 && matchedBanner.featured6.length > 0) {
                const normFeatured = matchedBanner.featured6.map(normalize);
                const isFeatured = normFeatured.includes(itemName);
                if (!isHardPityTriggered) {
                    stats.total5050++;
                    if (isFeatured) stats.won5050++;
                }

                if (isFeatured) {
                    rateUpCounter = 0;
                }
            } 

            currentPity6 = 0;
        } else {
            if (!isFree) currentPity6++;
        }

        if (pull.rarity === 5) {
            stats.total5++;
            stats.sumPity5 += currentPity5 + (isFree ? 0 : 1);
            currentPity5 = 0;
        } else {
            if (!isFree) currentPity5++;
        }
    });

    return stats;
}

const normalize = (str) => {
    if (!str || typeof str !== 'string') return "";
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
};

function normalizeBannerId(rawId) {
    if (!rawId) return 'special';
    const lower = rawId.toLowerCase();
    
    if (['weap-standard', 'weap-special', 'standard', 'special', 'new-player'].includes(lower)) return lower;

    if (lower.includes('weapon') || lower.includes('wepon') || lower.includes('weap')) {
        if (lower.includes('constant') || lower.includes('standard')) return 'weap-standard';
        return 'weap-special';
    }
    if (lower.includes('new') || lower.includes('beginner')) return 'new-player';
    if (lower.includes('standard')) return 'standard';
    return 'special';
}

app.get('/api/rankings/data', async (req, res) => {
    try {
        const { bannerId, uid } = req.query;
        if (!bannerId) return res.status(400).json({ code: 1, message: "Banner ID required" });

        const targetCategory = normalizeBannerId(bannerId);

        const allStats = await prisma.userBannerStat.findMany({
            where: { bannerId: targetCategory },
            select: {
                uid: true,
                totalPulls: true,
                total6: true, sumPity6: true,
                total5: true, sumPity5: true,
                won5050: true, total5050: true
            }
        });

        if (allStats.length === 0) return res.json({ code: 0, data: { found: false, totalUsers: 0 } });

        const usersWithAvg = allStats.map(s => ({
            ...s,
            avg6: s.total6 > 0 ? s.sumPity6 / s.total6 : 0,
            avg5: s.total5 > 0 ? s.sumPity5 / s.total5 : 0,
            winRate: s.total5050 > 0 ? (s.won5050 / s.total5050) * 100 : 0
        }));

        const myStat = usersWithAvg.find(u => u.uid === uid);
        if (!myStat) return res.json({ code: 0, data: { found: false, totalUsers: allStats.length } });

        // CALCULATE RANKS (Percentile: 100 = Best, 0 = Worst)
        
        // Luck 6 (Lower avg is better)
        const validLuck6 = usersWithAvg.filter(u => u.total6 > 0).sort((a, b) => a.avg6 - b.avg6);
        const myLuck6Index = validLuck6.findIndex(u => u.uid === uid);
        let rankLuck6 = null;
        if (myLuck6Index !== -1) {
            rankLuck6 = ((validLuck6.length - 1 - myLuck6Index) / validLuck6.length * 100);
        }

        // Luck 5
        const validLuck5 = usersWithAvg.filter(u => u.total5 > 0).sort((a, b) => a.avg5 - b.avg5);
        const myLuck5Index = validLuck5.findIndex(u => u.uid === uid);
        let rankLuck5 = null;
        if (myLuck5Index !== -1) {
            rankLuck5 = ((validLuck5.length - 1 - myLuck5Index) / validLuck5.length * 100);
        }

        // Total Pulls (Higher is better for "Top X%")
        const sortedTotal = [...usersWithAvg].sort((a, b) => b.totalPulls - a.totalPulls);
        const myTotalIndex = sortedTotal.findIndex(u => u.uid === uid);
        const rankTotal = ((sortedTotal.length - 1 - myTotalIndex) / sortedTotal.length * 100);

        // 50/50 Wins (Higher % is better)
        const valid5050 = usersWithAvg.filter(u => u.total5050 > 0).sort((a, b) => b.winRate - a.winRate);
        const my5050Index = valid5050.findIndex(u => u.uid === uid);
        let rank5050 = null;
        if (my5050Index !== -1) {
            rank5050 = ((valid5050.length - 1 - my5050Index) / valid5050.length * 100);
        }

        res.json({
            code: 0,
            data: {
                found: true,
                totalUsers: allStats.length,
                rankTotal,
                rankLuck6,
                rankLuck5,
                rank5050,
                myStats: {
                    total: myStat.totalPulls,
                    avg6: myStat.avg6.toFixed(1),
                    avg5: myStat.avg5.toFixed(1),
                    winRate: myStat.winRate.toFixed(1)
                }
            }
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ code: 500, message: "Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on ${PORT}`);
});