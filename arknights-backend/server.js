const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { URL, URLSearchParams } = require('url');
const { BANNERS } = require('./banners');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

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
try {
    prisma = new PrismaClient();
} catch (e) {
    console.warn("Prisma Client not initialized.");
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
                    finalPoolId = item.poolId || item.bannerId || mapPoolTypeToShort(poolType);

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
                if (pageCount > 2000) hasMore = false;

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

    let usedServerId = null;

    try {
        const parsedUrl = new URL(rawUrl);
        if (!parsedUrl.hostname.endsWith('hg-game.com') && !parsedUrl.hostname.endsWith('gryphline.com')) {
            return res.status(400).json({ error: "Invalid domain" });
        }

        const token = parsedUrl.searchParams.get('token') || parsedUrl.searchParams.get('u8_token');
        const lang = 'en-us';

        if (!token) return res.status(400).json({ error: "No token found in URL" });
        const urlServerId = parsedUrl.searchParams.get('server_id');
        const serverCandidates = new Set();

        if (urlServerId) {
            serverCandidates.add(urlServerId);
        }
        serverCandidates.add('3');
        serverCandidates.add('2');
        console.log(`\n--- New Import Request ---`);

        let allPulls = [];
        let usedServerId = null;
        for (const serverId of serverCandidates) {
            console.log(`Checking Server ID: ${serverId}...`);
            const pulls = await fetchGameData(token, lang, serverId);

            if (pulls.length > 0) {
                console.log(`✅ Data found on Server ID: ${serverId}`);
                allPulls = pulls;
                usedServerId = serverId;
                break;
            } else {
                console.log(`❌ No data on Server ID: ${serverId}`);
            }
        }

        console.log(`--- Import Finished. Total: ${allPulls.length} ---`);

        if (allPulls.length === 0) {
            return res.status(400).json({ error: "No pulls found on any checked server (checked URL params, 3, and 2)" });
        }

        const stableUid = generateStableUid(allPulls);

        if (!stableUid) {
            return res.status(400).json({ error: "Unable to generate UID from pulls" });
        }

        console.log(`User Stable UID: ${stableUid}`);

        if (prisma) {
            await updateAggregatedStats(stableUid, allPulls, usedServerId);
        }

        res.json({
            code: 0,
            data: {
                list: allPulls,
                uid: stableUid,
                serverId: usedServerId
            }
        });

    } catch (error) {
        console.error("Critical Server Error:", error);
        await logImportError(rawUrl, error, usedServerId);
        res.status(500).json({
            error: "Internal Server Error",
            message: error.message
        });
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

async function updateAggregatedStats(uid, allPulls, serverId) {
    if (!allPulls.length) return;

    await prisma.user.upsert({ where: { uid }, update: {}, create: { uid } });

    const pullsByBanner = {};
    const offset = getServerOffset(serverId);

    // --- ЭТАП 1: Подготовка данных ---
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

    // --- ЭТАП 2: Обновление КОНКРЕТНЫХ баннеров (для Глобала и Истории) ---
    for (const [bannerId, rawPulls] of Object.entries(pullsByBanner)) {
        
        const { stats, enrichedPulls } = calculateMath(rawPulls, bannerId, serverId);

        // --- Глобальная статистика (Дельта логика) ---
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

        // Графики
        const lastTime = Number(oldUserStat?.lastProcessedPullTime || 0);
        const newGlobalPulls = enrichedPulls.filter(p => p.time > lastTime);
        if (newGlobalPulls.length > 0) {
            await processGlobalGraphsOnly(bannerId, newGlobalPulls);
        }

        // Запись UserBannerStat (Specific ID)
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

    // --- ЭТАП 3: Обновление ОБЩИХ категорий (ДЛЯ РЕЙТИНГА) ---
    // Рейтинг ищет 'special', 'standard' и т.д. Нам нужно собрать их и обновить.
    
    console.log(`--- Updating Generic Categories for Rankings (${uid}) ---`);
    
    // Группируем ВСЕ крутки по общим категориям
    const pullsByGeneric = {
        'special': [],
        'standard': [],
        'weap-standard': [],
        'weap-special': [],
        'new-player': []
    };

    allPulls.forEach(p => {
        // Используем твою функцию normalizeBannerId из server.js
        const genId = normalizeBannerId(p.poolId || p.bannerId);
        if (pullsByGeneric[genId]) {
            // Важно: нужно передавать крутки с правильным временем!
            let pullTimeMs = 0;
            if (p.gachaTs) pullTimeMs = Number(p.gachaTs);
            else if (p.timestamp) pullTimeMs = Number(p.timestamp) * 1000;
            else if (p.ts) pullTimeMs = Number(p.ts) * 1000;
            else if (p.time) pullTimeMs = new Date(p.time).getTime();
            if (!pullTimeMs || isNaN(pullTimeMs)) pullTimeMs = Date.now();

            pullsByGeneric[genId].push({ ...p, time: pullTimeMs });
        }
    });

    for (const [genId, pulls] of Object.entries(pullsByGeneric)) {
        if (!pulls.length) continue;

        // Считаем стату для всей категории (например, всё что 'special')
        const { stats } = calculateMath(pulls, genId, serverId);

        // Пишем в базу с ID = 'special' (или 'standard' и т.д.)
        // Именно эту запись читает API рейтинга!
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
                lastProcessedPullTime: 0 // Для общих категорий это поле не так важно
            },
            update: {
                totalPulls: stats.totalPulls, // Жесткая перезапись
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

function findBannerConfigByTime(timestamp, categoryContext, offset) {
    const time = new Date(timestamp).getTime();
    const BUFFER = 12 * 60 * 60 * 1000;

    let targetType = null;
    if (categoryContext) {
        if (categoryContext.includes('weap')) targetType = 'weapon';
        else if (categoryContext.includes('new')) targetType = 'new-player';
        else if (categoryContext === 'standard') targetType = 'standard';
        else if (categoryContext === 'special') targetType = 'special';
    }

    const candidates = BANNERS.filter(b => {
        if (targetType) {
            const isBannerWeapon = b.type === 'weapon' || (b.id && b.id.includes('weap'));
            if (targetType === 'weapon' && !isBannerWeapon) return false;
            if (targetType !== 'weapon' && isBannerWeapon) return false;

            if (targetType === 'standard' && b.type !== 'standard') return false;
            if (targetType === 'special' && b.type !== 'special') return false;
        }

        const start = parseDateWithServer(b.startTime, offset).getTime();
        const end = b.endTime ? parseDateWithServer(b.endTime, offset).getTime() : Infinity;

        return time >= (start - BUFFER) && time <= (end + BUFFER);
    });

    if (candidates.length > 0) {
        candidates.sort((a, b) =>
            parseDateWithServer(b.startTime, offset).getTime() -
            parseDateWithServer(a.startTime, offset).getTime()
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
    const offset = getServerOffset(serverId);
    const foundBanner = findBannerConfigByTime(pull.time, rawId, offset);

    if (foundBanner) return foundBanner.id;

    const d = new Date(Number(pull.time));
    return `gen_${rawId}_${d.getFullYear()}_${d.getMonth()}_w${Math.floor(d.getDate() / 7)}`;
}

function calculateMath(pulls, categoryId, serverId = '3') {
    // 1. Сортировка
    pulls.sort((a, b) => {
        const tDiff = new Date(a.time).getTime() - new Date(b.time).getTime();
        if (tDiff !== 0) return tDiff;
        return (Number(a.seqId) || 0) - (Number(b.seqId) || 0);
    });

    const isWeaponType = categoryId.includes('weap') || categoryId.includes('wepon') || categoryId.includes('constant');
    const hardPityLimit = isWeaponType ? 80 : 120;

    // Проверяем, считаем ли мы Общую Категорию (где много разных баннеров)
    // или Конкретный Баннер (где список персонажей фиксирован)
    const specificBannerConfig = BANNERS.find(b => b.id === categoryId);
    const isGenericCalculation = !specificBannerConfig; // Если конфига нет по ID, значит это generic (special, weapon...)

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

    pulls.forEach((pull, index) => {
        const p = { ...pull };
        const itemName = normalize(p.name);
        
        // Логика бесплатных круток (30-40)
        // Для Generic категорий это может быть не совсем точно, но оставляем как есть
        const isSpecialCharBanner = categoryId.includes('special') && !isWeaponType;
        const isFreePull = isSpecialCharBanner && (index >= 30 && index < 40);

        let isHardPityTriggered = false;
        if (!isFreePull) {
            if (rateUpCounter >= hardPityLimit - 1) isHardPityTriggered = true;
            rateUpCounter++;
        }

        if (p.rarity === 6) {
            count6++;
            const thisPity = currentPity6 + (isFreePull ? 0 : 1);
            sumPity6 += thisPity;
            p.pity = thisPity;

            // --- ОПРЕДЕЛЕНИЕ: ЭТО ПОБЕДА ИЛИ НЕТ? ---
            let currentFeaturedList = [];
            let bannerDebugName = "Unknown";

            if (isGenericCalculation) {
                // Если это Общая категория, ищем, к какому баннеру относилась ЭТА крутка по времени
                const rawId = p.poolId || p.bannerId || categoryId;
                const foundConfig = findBannerConfigByTime(p.time, rawId, offset);
                
                if (foundConfig) {
                    currentFeaturedList = foundConfig.featured6 || [];
                    bannerDebugName = foundConfig.id;
                }
            } else {
                // Если это Конкретный баннер, берем его список
                currentFeaturedList = specificBannerConfig.featured6 || [];
                bannerDebugName = specificBannerConfig.id;
            }

            const normFeatured = currentFeaturedList.map(n => normalize(n));
            
            // Проверка на совпадение (Имя чара ИЛИ Имя как ID)
            const isFeatured = normFeatured.includes(itemName) || normFeatured.includes(normalize(p.name));

            // ЛОГ ДЛЯ ОТЛАДКИ (Покажет почему 0% или 100%)
            if (isGenericCalculation) {
                console.log(`   [6* CHECK] Pull: ${p.name} (${p.time})`);
                console.log(`       -> Detected Banner: ${bannerDebugName}`);
                console.log(`       -> Featured List: [${normFeatured.join(', ')}]`);
                console.log(`       -> Is Match? ${isFeatured} | HardPity? ${isHardPityTriggered}`);
            }
            
            if (isFeatured) {
                if (isHardPityTriggered) {
                    p.gachaStatus = "guaranteed"; 
                    if (isGenericCalculation) console.log(`       -> Result: GUARANTEED (Ignored in 50/50)`);
                } else {
                    won5050++;
                    total5050++;
                    p.gachaStatus = "won";
                    if (isGenericCalculation) console.log(`       -> Result: WIN (+1 Won, +1 Total)`);
                }
                rateUpCounter = 0;
            } else {
                total5050++;
                p.gachaStatus = "lost";
                if (isGenericCalculation) console.log(`       -> Result: LOSS (+0 Won, +1 Total)`);
            }
            currentPity6 = 0;
        } else {
            if (!isFreePull) currentPity6++;
            p.pity = currentPity6;
        }

        if (p.rarity === 5) {
            count5++;
            const thisPity5 = currentPity5 + (isFreePull ? 0 : 1);
            sumPity5 += thisPity5;
            currentPity5 = 0;
        } else {
            if (!isFreePull) currentPity5++;
        }
        enrichedPulls.push(p);
    });

    const winRate = total5050 > 0 ? (won5050 / total5050 * 100) : 0;

    if (isGenericCalculation) {
        console.log(`[MATH END] ${categoryId} -> Won: ${won5050} / Total: ${total5050} = ${winRate.toFixed(1)}%`);
    }

    return { 
        stats: { totalPulls: total, total6: count6, sumPity6, total5: count5, sumPity5, won5050, total5050, winRate }, 
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

app.get('/api/admin/errors', async (req, res) => {
    if (req.headers['x-admin-secret'] !== 'florest555') return res.sendStatus(403);

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