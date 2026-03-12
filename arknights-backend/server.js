const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { URL, URLSearchParams } = require('url');
const { BANNERS } = require('./banners');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const importLimiter = rateLimit({
    windowMs: 60 * 1000,
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
if (process.env.DATABASE_URL) {
    try {
        prisma = new PrismaClient();
        console.log("Database connection initialized.");
    } catch (e) {
        console.warn("Prisma Client failed to initialize:", e.message);
    }
} else {
    console.log("Running in Local Mode. Stats will not be saved.");
}

const PORT = 3001;

function generatePullId(uid, pull) {
    return `${uid}_${pull.seqId || pull.timestamp}`;
}

function getServerOffset(serverId) {
    const sid = String(serverId);
    if (sid === '2') return 8;
    return -5;
}

function getBannerDates(banner, serverId) {
    if (!banner) return { startStr: null, endStr: null };
    const isAsia = String(serverId) === '2';

    const startStr = (isAsia && banner.startTimeAsia) ? banner.startTimeAsia : banner.startTime;
    const endStr = (isAsia && banner.endTimeAsia) ? banner.endTimeAsia : banner.endTime;

    return { startStr, endStr };
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

async function fetchGameData(token, lang, serverId, onProgress) {
    console.log(`\n--- Starting PARALLEL Scan on SERVER ID: ${serverId} ---`);
    let isTokenInvalid = false;

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

        const poolLabel = isWeaponScan ? 'weapon-all' : mapPoolTypeToShort(poolType);

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
                    if (result.code === 40100) {
                        isTokenInvalid = true;
                    }
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

                if (onProgress && newItems.length > 0) {
                    const countsByCat = {};

                    newItems.forEach(item => {
                        const rawId = item.poolId || item.bannerId || poolLabel;
                        const catId = normalizeBannerId(rawId);

                        countsByCat[catId] = (countsByCat[catId] || 0) + 1;
                    });

                    for (const [catId, count] of Object.entries(countsByCat)) {
                        onProgress({
                            type: 'progress',
                            poolId: catId,
                            count: count
                        });
                    }
                }

                const listWithMeta = newItems.map(item => {
                    let finalPoolId;
                    finalPoolId = item.poolId || item.bannerId || mapPoolTypeToShort(poolType);

                    return {
                        ...item,
                        name: item.name || item.charName || item.weaponName,
                        poolId: finalPoolId,
                        itemType: isWeaponScan ? 'weapon' : 'character',
                        isFree: item.isFree
                    };
                });

                poolPulls = [...poolPulls, ...listWithMeta];

                hasMore = result.data?.hasMore;
                if (newItems.length === 0) hasMore = false;
                else if (list.length > 0) lastId = list[list.length - 1].seqId;
                else hasMore = false;

                pageCount++;
                if (pageCount > 2000) hasMore = false;

                await sleep(50);

            } catch (err) {
                if (err.isTokenError) throw err;
                console.error(`Error scanning ${poolLabel}: ${err.message}`);
                hasMore = false;
            }
        }
        return poolPulls;
    };

    try {
        const results = await Promise.all(POOL_TYPES.map(type => fetchPool(type)));
        const allPulls = results.flat();
        
        return { 
            pulls: allPulls, 
            isTokenInvalid: isTokenInvalid && allPulls.length === 0 
        };
    } catch (e) {
        console.error("Parallel fetch failed", e);
        return { pulls: [], isTokenInvalid: false };
    }
}

app.post('/api/import', importLimiter, async (req, res) => {
    const { rawUrl } = req.body;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Transfer-Encoding': 'chunked'
    });

    const sendEvent = (data) => {
        res.write(JSON.stringify(data) + "\n");
        if (res.flush) res.flush();
    };

    let usedServerId = null;

    try {
        const parsedUrl = new URL(rawUrl);
        if (!parsedUrl.hostname.endsWith('hg-game.com') && !parsedUrl.hostname.endsWith('gryphline.com')) {
            sendEvent({ type: 'error', message: "Invalid domain" });
            return res.end();
        }

        const token = parsedUrl.searchParams.get('token') || parsedUrl.searchParams.get('u8_token');
        const lang = 'en-us';

        if (!token) {
            sendEvent({ type: 'error', message: "No token found in URL" });
            return res.end();
        }

        const urlServerId = parsedUrl.searchParams.get('server_id');
        const serverCandidates = new Set();

        if (urlServerId) {
            serverCandidates.add(urlServerId);
        }
        serverCandidates.add('3');
        serverCandidates.add('2');

        console.log(`\n--- New Import Request (Streaming) ---`);

        let allPulls = [];
        let tokenWasInvalidAtLeastOnce = false;

        const progressCallback = (data) => {
            sendEvent(data);
        };

        for (const serverId of serverCandidates) {
            console.log(`Checking Server ID: ${serverId}...`);
            const result = await fetchGameData(token, lang, serverId, progressCallback);

            if (result.pulls.length > 0) {
                console.log(`✅ Data found on Server ID: ${serverId}`);
                allPulls = result.pulls;
                usedServerId = serverId;
                break;
            }
            
            if (result.isTokenInvalid) {
                tokenWasInvalidAtLeastOnce = true;
            }
        }

        if (allPulls.length === 0) {
            if (tokenWasInvalidAtLeastOnce) {
                sendEvent({ type: 'error', message: "Token is invalid or expired. Please generate a new link." });
            } else {
                sendEvent({ type: 'error', message: "No pulls found or link expired" });
            }
            return res.end();
        }

        const stableUid = generateStableUid(allPulls);
        if (!stableUid) {
            sendEvent({ type: 'error', message: "Unable to generate UID" });
            return res.end();
        }

        if (prisma) {
            await updateAggregatedStats(stableUid, allPulls, usedServerId);
        }

        sendEvent({
            type: 'complete',
            data: {
                list: allPulls,
                uid: stableUid,
                serverId: usedServerId
            }
        });
        res.end();

    } catch (error) {
        console.error("Critical Server Error:", error);
        await logImportError(rawUrl, error, usedServerId);
        sendEvent({ type: 'error', message: error.message || "Internal Server Error" });
        res.end();
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
    if (longType === 'WEAPON_FETCH_ALL') return 'weapon-all';
    if (longType.includes('Weapon') && longType.includes('Standard')) return 'weap-standard';
    if (longType.includes('Weapon') && longType.includes('Special')) return 'weap-special';
    if (longType.includes('constant')) return 'weap-standard';
    if (longType.includes('weponbox')) return 'weap-special';

    return 'unknown';
}

async function updateAggregatedStats(uid, allPulls, serverId) {
    if (!prisma) return;
    if (!allPulls.length) return;

    await prisma.user.upsert({ where: { uid }, update: {}, create: { uid } });

    const pullsByBanner = {};
    const offset = getServerOffset(serverId);

    allPulls.forEach(p => {
        let pullTimeMs = 0;
        if (p.gachaTs) pullTimeMs = Number(p.gachaTs);
        else if (p.timestamp) pullTimeMs = Number(p.timestamp) * 1000;
        else if (p.ts) pullTimeMs = Number(p.ts) * 1000;
        else if (p.time) pullTimeMs = new Date(p.time).getTime();

        if (!pullTimeMs || isNaN(pullTimeMs)) pullTimeMs = Date.now();

        const pullWithCorrectTime = { ...p, time: pullTimeMs };
        const specificBannerId = getDistinctBannerId(pullWithCorrectTime, serverId);

        if (!pullsByBanner[specificBannerId]) pullsByBanner[specificBannerId] = [];
        pullsByBanner[specificBannerId].push(pullWithCorrectTime);
    });

    for (const [bannerId, rawPulls] of Object.entries(pullsByBanner)) {

        const { stats, enrichedPulls } = calculateMath(rawPulls, bannerId, serverId);

        const oldUserStat = await prisma.userBannerStat.findUnique({
            where: { uid_bannerId: { uid, bannerId } }
        });

        const oldTotalPulls = oldUserStat?.totalPulls || 0;
        const oldTotal6 = oldUserStat?.total6 || 0;
        const oldTotal5 = oldUserStat?.total5 || 0;
        const oldWon = oldUserStat?.won5050 || 0;
        const oldTotal5050 = oldUserStat?.total5050 || 0;
        const oldLost = oldTotal5050 - oldWon;

        const newLost = stats.total5050 - stats.won5050;

        const d_totalPulls = stats.totalPulls - oldTotalPulls;
        const d_total6 = stats.total6 - oldTotal6;
        const d_total5 = stats.total5 - oldTotal5;
        const d_limited = stats.won5050 - oldWon;
        const d_lost = newLost - oldLost;
        const d_users = oldUserStat ? 0 : 1;

        if (d_totalPulls !== 0 || d_total6 !== 0 || d_limited !== 0 || d_lost !== 0) {
            await prisma.globalBannerStats.upsert({
                where: { bannerId },
                create: {
                    bannerId,
                    totalPulls: stats.totalPulls,
                    total6: stats.total6,
                    total5: stats.total5,
                    limitedCount: stats.won5050,
                    lost5050: newLost,
                    totalUsers: 1
                },
                update: {
                    totalPulls: { increment: d_totalPulls },
                    total6: { increment: d_total6 },
                    total5: { increment: d_total5 },
                    limitedCount: { increment: d_limited },
                    lost5050: { increment: d_lost },
                    totalUsers: { increment: d_users }
                }
            });
        }

        const lastTime = Number(oldUserStat?.lastProcessedPullTime || 0);
        const newGlobalPulls = enrichedPulls.filter(p => p.time > lastTime);
        if (newGlobalPulls.length > 0) {
            await processGlobalGraphsOnly(bannerId, newGlobalPulls);
        }

        const maxTimeInBatch = enrichedPulls[enrichedPulls.length - 1].time;

        await prisma.userBannerStat.upsert({
            where: { uid_bannerId: { uid, bannerId } },
            create: {
                uid, bannerId,
                totalPulls: stats.totalPulls,
                total6: stats.total6,
                sumPity6: stats.sumPity6,
                total5: stats.total5,
                sumPity5: stats.sumPity5,
                won5050: stats.won5050,
                total5050: stats.total5050,
                lastProcessedPullTime: BigInt(maxTimeInBatch)
            },
            update: {
                totalPulls: stats.totalPulls,
                total6: stats.total6,
                sumPity6: stats.sumPity6,
                total5: stats.total5,
                sumPity5: stats.sumPity5,
                won5050: stats.won5050,
                total5050: stats.total5050,
                lastUpdate: new Date(),
                lastProcessedPullTime: BigInt(maxTimeInBatch)
            }
        });
    }

    console.log(`--- Updating Generic Categories for Rankings (${uid}) ---`);

    const pullsByGeneric = {
        'special': [],
        'standard': [],
        'weap-standard': [],
        'weap-special': [],
        'new-player': []
    };

    allPulls.forEach(p => {
        const genId = normalizeBannerId(p.poolId || p.bannerId);
        if (pullsByGeneric[genId]) {
            let pullTimeMs = 0;
            if (p.gachaTs) pullTimeMs = Number(p.gachaTs);
            else if (p.timestamp) pullTimeMs = Number(p.timestamp) * 1000;
            else if (p.ts) pullTimeMs = Number(p.ts) * 1000;
            else if (p.time) pullTimeMs = new Date(p.time).getTime();
            if (!pullTimeMs || isNaN(pullTimeMs)) pullTimeMs = Date.now();

            pullsByGeneric[genId].push({ ...p, time: pullTimeMs });
        }
    });

    let overallStats = {
        totalPulls: 0,
        total6: 0, sumPity6: 0,
        total5: 0, sumPity5: 0,
        won5050: 0, total5050: 0
    };

    const RATE_UP_CATEGORIES = ['special', 'weap-special', 'weap-standard'];

    for (const [genId, pulls] of Object.entries(pullsByGeneric)) {
        if (!pulls.length) continue;

        const { stats } = calculateMath(pulls, genId, serverId);

        if (genId !== 'new-player') {
            overallStats.totalPulls += stats.totalPulls;
            overallStats.total6 += stats.total6;
            overallStats.sumPity6 += stats.sumPity6;
            overallStats.total5 += stats.total5;
            overallStats.sumPity5 += stats.sumPity5;
            if (RATE_UP_CATEGORIES.includes(genId)) {
                overallStats.won5050 += stats.won5050;
                overallStats.total5050 += stats.total5050;
            }
        }

        await prisma.userBannerStat.upsert({
            where: { uid_bannerId: { uid, bannerId: genId } },
            create: {
                uid, bannerId: genId,
                totalPulls: stats.totalPulls,
                total6: stats.total6,
                sumPity6: stats.sumPity6,
                total5: stats.total5,
                sumPity5: stats.sumPity5,
                won5050: stats.won5050,
                total5050: stats.total5050,
                lastProcessedPullTime: 0
            },
            update: {
                totalPulls: stats.totalPulls,
                total6: stats.total6,
                sumPity6: stats.sumPity6,
                total5: stats.total5,
                sumPity5: stats.sumPity5,
                won5050: stats.won5050,
                total5050: stats.total5050,
                lastUpdate: new Date()
            }
        });
        console.log(`   -> Ranked Category [${genId}]: Updated to ${stats.totalPulls} pulls`);
    }

    if (overallStats.totalPulls > 0) {
        await prisma.userBannerStat.upsert({
            where: { uid_bannerId: { uid, bannerId: 'all' } },
            create: {
                uid, bannerId: 'all',
                totalPulls: overallStats.totalPulls,
                total6: overallStats.total6, sumPity6: overallStats.sumPity6,
                total5: overallStats.total5, sumPity5: overallStats.sumPity5,
                won5050: overallStats.won5050, total5050: overallStats.total5050,
                lastProcessedPullTime: 0
            },
            update: {
                totalPulls: overallStats.totalPulls,
                total6: overallStats.total6, sumPity6: overallStats.sumPity6,
                total5: overallStats.total5, sumPity5: overallStats.sumPity5,
                won5050: overallStats.won5050, total5050: overallStats.total5050,
                lastUpdate: new Date()
            }
        });
        console.log(`   -> RANKING [ALL]: Updated (Total: ${overallStats.totalPulls}, WinRate Base: ${overallStats.won5050}/${overallStats.total5050})`);
    }

    console.log(`[Stats] Sync Complete for ${uid}`);
}

async function processGlobalGraphsOnly(bannerId, newPulls) {
    const timelineUpdates = {};
    const pityUpdates6 = {};
    const itemUpdates = {};

    newPulls.forEach(p => {
        const dateKey = new Date(p.time).toISOString().split('T')[0];
        timelineUpdates[dateKey] = (timelineUpdates[dateKey] || 0) + 1;

        const normName = p.name;
        if (!itemUpdates[normName]) itemUpdates[normName] = { rarity: p.rarity, count: 0 };
        itemUpdates[normName].count++;

        if (p.rarity === 6 && p.pity) {
            pityUpdates6[p.pity] = (pityUpdates6[p.pity] || 0) + 1;
        }
    });

    for (const [date, count] of Object.entries(timelineUpdates)) {
        await prisma.globalTimeline.upsert({
            where: { bannerId_date: { bannerId, date } },
            create: { bannerId, date, pulls: count },
            update: { pulls: { increment: count } }
        });
    }

    for (const [name, data] of Object.entries(itemUpdates)) {
        await prisma.globalItemStats.upsert({
            where: { bannerId_itemName: { bannerId, itemName: name } },
            create: { bannerId, itemName: name, rarity: data.rarity, count: data.count },
            update: { count: { increment: data.count } }
        });
    }

    for (const [pityVal, count] of Object.entries(pityUpdates6)) {
        await prisma.globalPityDistribution.upsert({
            where: { bannerId_rarity_pity: { bannerId, rarity: 6, pity: Number(pityVal) } },
            create: { bannerId, rarity: 6, pity: Number(pityVal), count },
            update: { count: { increment: count } }
        });
    }
}

function parseDateWithServer(dateStr, offset) {
    if (!dateStr) return null;

    if (dateStr.includes("Z") || dateStr.includes("+")) return new Date(dateStr);

    const sign = offset >= 0 ? "+" : "-";
    const pad = (n) => String(Math.abs(n)).padStart(2, '0');
    const isoStr = dateStr.replace(" ", "T") + `${sign}${pad(offset)}:00`;
    return new Date(isoStr);
}

function findBannerConfigByTime(timestamp, categoryContext, serverId) {
    const time = new Date(timestamp).getTime();
    const BUFFER = 12 * 60 * 60 * 1000;

    const offset = getServerOffset(serverId);

    let targetType = null;
    let isWeaponStandard = false;
    let isWeaponSpecial = false;

    if (categoryContext) {
        if (categoryContext === 'weap-standard') {
            targetType = 'weapon';
            isWeaponStandard = true;
        }
        else if (categoryContext === 'weap-special') {
            targetType = 'weapon';
            isWeaponSpecial = true;
        }
        else if (categoryContext.includes('weap')) targetType = 'weapon';
        else if (categoryContext.includes('new')) targetType = 'new-player';
        else if (categoryContext === 'standard') targetType = 'standard';
        else if (categoryContext === 'special') targetType = 'special';
    }

    const candidates = BANNERS.filter(b => {
        const dates = getBannerDates(b, serverId);

        const start = parseDateWithServer(dates.startStr, offset).getTime();
        const end = dates.endStr ? parseDateWithServer(dates.endStr, offset).getTime() : Infinity;
        if (time < (start - BUFFER) || time > (end + BUFFER)) return false;

        if (targetType) {
            const isBannerWeapon = b.type === 'weapon' || (b.id && (b.id.includes('weap') || b.id.includes('wepon')));
            if (targetType === 'weapon' && !isBannerWeapon) return false;
            if (targetType !== 'weapon' && isBannerWeapon) return false;

            if (isWeaponStandard) {
                if (!b.id.includes('constant') && !b.id.includes('standard')) return false;
            }
            if (isWeaponSpecial) {
                if (!b.id.includes('weponbox') && !b.id.includes('special')) return false;
            }

            if (targetType === 'standard' && b.type !== 'standard') return false;
            if (targetType === 'special' && b.type !== 'special') return false;
        }

        return true;
    });

    if (candidates.length > 0) {
        candidates.sort((a, b) =>
            parseDateWithServer(getBannerDates(b, serverId).startStr, offset).getTime() -
            parseDateWithServer(getBannerDates(a, serverId).startStr, offset).getTime()
        );
        return candidates[0];
    }

    return undefined;
}

function getDistinctBannerId(pull, serverId) {
    const rawId = pull.poolId || 'unknown';
    const genericIds = ['special', 'standard', 'weapon', 'weap-special', 'weap-standard', 'new-player', 'E_CharacterGachaPoolType_Special'];

    if (!genericIds.includes(rawId) && !rawId.startsWith('E_')) {
        return rawId;
    }

    const foundBanner = findBannerConfigByTime(pull.time, rawId, serverId);

    if (foundBanner) return foundBanner.id;

    const d = new Date(Number(pull.time));
    return `gen_${rawId}_${d.getFullYear()}_${d.getMonth()}_w${Math.floor(d.getDate() / 7)}`;
}

function calculateMath(pulls, categoryId, serverId = '3') {
    pulls.sort((a, b) => {
        const tDiff = new Date(a.time).getTime() - new Date(b.time).getTime();
        if (tDiff !== 0) return tDiff;
        return (Number(a.seqId) || 0) - (Number(b.seqId) || 0);
    });

    const isWeaponType = categoryId.includes('weap') || categoryId.includes('wepon') || categoryId.includes('constant');
    const hardPityLimit = isWeaponType ? 80 : 120;

    const specificBannerConfig = BANNERS.find(b => b.id === categoryId);
    const isGenericCalculation = !specificBannerConfig;

    if (pulls.length > 0 && isGenericCalculation) {
        console.log(`\n[MATH DEBUG] Calculating Generic Category: "${categoryId}" (Pulls: ${pulls.length})`);
    }

    let total = pulls.length;
    let count6 = 0, count5 = 0;
    let sumPity6 = 0, sumPity5 = 0;
    let won5050 = 0, total5050 = 0;

    let currentPity6 = 0;
    let currentPity5 = 0;
    let rateUpCounter = 0;

    const offset = getServerOffset(serverId);
    const enrichedPulls = [];

    pulls.forEach((pull) => {
        const p = { ...pull };
        const itemName = normalize(p.name);
        const isFreePull = p.isFree === true;

        if (!isFreePull) {
            currentPity6++;
            currentPity5++;
            rateUpCounter++;
        }

        const isHardPityTriggered = rateUpCounter >= hardPityLimit;

        if (p.rarity === 6) {
            p.pity = isFreePull ? 1 : currentPity6;

            if (!isFreePull) {
                count6++;
                sumPity6 += currentPity6;
                console.log(`   [6* PAID] ${p.name} | Pity: ${currentPity6} | Total6: ${count6} | Avg: ${(sumPity6 / count6).toFixed(1)}`);

                currentPity6 = 0;
                currentPity5 = 0;
            } else {
                console.log(`   [6* FREE] ${p.name} | Ignored in stats | Pity set to 1`);
            }

            let currentFeaturedList = [];
            if (isGenericCalculation) {
                const timeMs = new Date(p.time).getTime();

                const candidates = BANNERS.filter(b => {
                    const dates = getBannerDates(b, serverId);

                    const start = parseDateWithServer(dates.startStr, offset).getTime();
                    const end = dates.endStr ? parseDateWithServer(dates.endStr, offset).getTime() : Infinity;
                    if (timeMs < start || timeMs > end) return false;

                    if (categoryId === 'weap-standard') return b.type === 'weapon' && (b.id.includes('constant') || b.id.includes('standard'));
                    if (categoryId === 'weap-special') return b.type === 'weapon' && !b.id.includes('constant') && !b.id.includes('standard');
                    if (categoryId === 'special') return b.type === 'special';
                    if (categoryId === 'standard') return b.type === 'standard';
                    if (categoryId === 'new-player') return b.type === 'new-player';
                    return false;
                });

                let bestBanner = candidates.find(b =>
                    b.featured6 && b.featured6.some(f => normalize(f) === itemName)
                );

                if (!bestBanner && candidates.length > 0) {
                    candidates.sort((a, b) =>
                        parseDateWithServer(getBannerDates(b, serverId).startStr, offset).getTime() -
                        parseDateWithServer(getBannerDates(a, serverId).startStr, offset).getTime()
                    );
                    bestBanner = candidates[0];
                }

                if (bestBanner) currentFeaturedList = bestBanner.featured6 || [];
            } else {
                currentFeaturedList = specificBannerConfig.featured6 || [];
            }

            const isFeatured = currentFeaturedList.map(n => normalize(n)).includes(itemName);

            if (categoryId === 'weponbox_1_0_2' && p.rarity === 6) {
                console.log(`[DEBUG 120] Item from game: "${itemName}"`);
                console.log(`[DEBUG 120] Featured in config:`, currentFeaturedList.map(n => normalize(n)));
            }

            if (!isFreePull) {
                if (isFeatured) {
                    if (isHardPityTriggered) {
                        p.gachaStatus = "guaranteed";
                    } else {
                        won5050++;
                        total5050++;
                        p.gachaStatus = "won";
                    }
                    rateUpCounter = 0;
                } else {
                    total5050++;
                    p.gachaStatus = "lost";
                }
            } else {
                p.gachaStatus = "free";
            }

        } else if (p.rarity === 5) {
            p.pity = isFreePull ? 1 : currentPity5;
            if (!isFreePull) {
                count5++;
                sumPity5 += currentPity5;
                currentPity5 = 0;
            }
        } else {
            p.pity = 1;
        }

        enrichedPulls.push(p);
    });

    const winRate = total5050 > 0 ? (won5050 / total5050 * 100) : 0;
    console.log(`[MATH END] ${categoryId} Result -> Avg6: ${(sumPity6 / count6 || 0).toFixed(1)} | WinRate: ${winRate.toFixed(1)}% (Won: ${won5050}/${total5050})`);

    return {
        stats: {
            totalPulls: total,
            total6: count6,
            sumPity6,
            total5: count5,
            sumPity5,
            won5050,
            total5050,
            winRate
        },
        enrichedPulls
    };
}

const normalize = (str) => {
    if (!str || typeof str !== 'string') return "";
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
};

function normalizeBannerId(rawId) {
    if (!rawId) return 'standard';
    const id = String(rawId).toLowerCase().trim();

    if (id === 'all') return 'all';

    if (id.includes('weapon') || id.includes('wepon') || id.includes('weap')) {
        if (id.includes('constant') || (id.includes('standard') && !id.includes('special'))) {
            return 'weap-standard';
        }
        return 'weap-special';
    }

    if (id === '2' || id.includes('beginner') || id.includes('new') || id.includes('novice')) return 'new-player';

    if (id === '1' || id.includes('standard') || id.includes('permanent')) return 'standard';

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
        const validLuck6 = usersWithAvg.filter(u => u.total6 > 0).sort((a, b) => a.avg6 - b.avg6);
        const myLuck6Index = validLuck6.findIndex(u => u.uid === uid);
        let rankLuck6 = null;
        if (myLuck6Index !== -1) {
            rankLuck6 = ((validLuck6.length - 1 - myLuck6Index) / validLuck6.length * 100);
        }

        const validLuck5 = usersWithAvg.filter(u => u.total5 > 0).sort((a, b) => a.avg5 - b.avg5);
        const myLuck5Index = validLuck5.findIndex(u => u.uid === uid);
        let rankLuck5 = null;
        if (myLuck5Index !== -1) {
            rankLuck5 = ((validLuck5.length - 1 - myLuck5Index) / validLuck5.length * 100);
        }

        const sortedTotal = [...usersWithAvg].sort((a, b) => b.totalPulls - a.totalPulls);
        const myTotalIndex = sortedTotal.findIndex(u => u.uid === uid);
        const rankTotal = ((sortedTotal.length - 1 - myTotalIndex) / sortedTotal.length * 100);

        const valid5050 = usersWithAvg
            .filter(u => u.total5050 > 0)
            .sort((a, b) => {
                if (Math.abs(b.winRate - a.winRate) > 0.001) {
                    return b.winRate - a.winRate;
                }

                if (b.winRate >= 50) {
                    return b.total5050 - a.total5050;
                } else {
                    return a.total5050 - b.total5050;
                }
            });
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

async function logImportError(url, errorObj, serverId = null) {
    try {
        if (!prisma) return;

        await prisma.importError.create({
            data: {
                url: url || "No URL provided",
                error: errorObj.message || String(errorObj),
                stack: errorObj.stack || null,
                serverId: serverId ? String(serverId) : null
            }
        });
        console.log("📝 Import error logged to DB");
    } catch (e) {
        console.error("Failed to log import error:", e);
    }
}

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'super_secret_fallback_key_123';

app.get('/api/admin/errors', async (req, res) => {
    const secret = process.env.ADMIN_SECRET;

    if (!secret || req.headers['x-admin-secret'] !== secret) {
        return res.sendStatus(403);
    }

    try {
        const errors = await prisma.importError.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' }
        });
        res.json(errors);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch errors" });
    }
});

app.get('/api/global/stats', async (req, res) => {
    try {
        const { bannerId } = req.query;
        if (!bannerId) return res.status(400).json({ error: "Banner ID required" });

        const mainStats = await prisma.globalBannerStats.findUnique({
            where: { bannerId }
        });

        if (!mainStats) {
            return res.json({
                totalPulls: 0, totalUsers: 0,
                medianPity: 0,
                items6: [], items5: [], items4: [],
                timeline: [], pityDist: []
            });
        }

        const timelineRaw = await prisma.globalTimeline.findMany({
            where: { bannerId },
            orderBy: { date: 'asc' }
        });
        const totalPullsNum = Number(mainStats.totalPulls);
        const timeline = timelineRaw.map(t => ({
            date: t.date,
            count: t.pulls,
            percent: totalPullsNum > 0 ? ((t.pulls / totalPullsNum) * 100).toFixed(2) : 0
        }));

        const pityDistRaw = await prisma.globalPityDistribution.findMany({
            where: { bannerId, rarity: 6 },
            orderBy: { pity: 'asc' }
        });

        let cumulativeCount = 0;
        let medianPity = 0;
        let medianFound = false;
        const halfTotal6 = mainStats.total6 / 2;

        const pityDist = pityDistRaw.map(p => {
            const chance = mainStats.total6 > 0 ? (p.count / mainStats.total6) * 100 : 0;

            cumulativeCount += p.count;
            if (!medianFound && cumulativeCount >= halfTotal6) {
                medianPity = p.pity;
                medianFound = true;
            }

            return {
                pity: p.pity,
                count: p.count,
                percent: chance.toFixed(2)
            };
        });

        const itemsRaw = await prisma.globalItemStats.findMany({
            where: { bannerId },
            orderBy: { count: 'desc' }
        });

        const formatItems = (rarity) => {
            const totalInRarity = rarity === 6 ? mainStats.total6 : rarity === 5 ? mainStats.total5 : 0;

            const filtered = itemsRaw.filter(i => i.rarity === rarity);
            const sumCount = filtered.reduce((a, b) => a + b.count, 0) || 1;
            const base = (rarity === 6 || rarity === 5) ? (rarity === 6 ? mainStats.total6 : mainStats.total5) : sumCount;

            return filtered.map(i => ({
                name: i.itemName,
                count: i.count,
                percent: base > 0 ? ((i.count / base) * 100).toFixed(2) : 0
            }));
        };

        const responseData = {
            limitedCount: mainStats.limitedCount,
            lost5050: mainStats.lost5050,
            totalPulls: Number(mainStats.totalPulls),
            total6: mainStats.total6,
            total5: mainStats.total5,
            totalUsers: mainStats.totalUsers,
            oroberylSpent: Number(mainStats.totalPulls) * 500,
            medianPity,
            timeline,
            pityDistribution: pityDist,
            items6: formatItems(6),
            items5: formatItems(5),
            items4: formatItems(4)
        };

        res.json({ code: 0, data: responseData });

    } catch (e) {
        console.error("Global Stats Error:", e);
        res.status(500).json({ error: "Failed to fetch global stats" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on ${PORT}`);
});