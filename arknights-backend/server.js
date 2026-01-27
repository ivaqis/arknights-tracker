const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { URL, URLSearchParams } = require('url');
const { BANNERS } = require('./banners');

const crypto = require('crypto');

function generateStableUid(pulls) {
    if (!pulls || pulls.length === 0) return null;

    // ВАРИАНТ 1 (Правильный): Ищем настоящий UID в данных
    // Пробегаем по списку и ищем любую запись, где есть поле uid
    const itemWithUid = pulls.find(p => p.uid && p.uid !== "" && p.uid !== "0");
    
    if (itemWithUid) {
        // Возвращаем реальный UID игрока (обычно это цифры, но приводим к строке)
        return itemWithUid.uid.toString();
    }

    // ВАРИАНТ 2 (Запасной): Если вдруг разработчики скрыли UID (маловероятно)
    // Генерируем хеш, но берем больше данных, чтобы избежать коллизий
    console.warn("⚠️ Real UID not found in pulls! Falling back to hash.");
    
    // Сортируем
    const sorted = [...pulls].sort((a, b) => a.timestamp - b.timestamp || a.seqId - b.seqId);

    // Берем первые 10 круток (вместо 3), шанс совпадения ниже
    const fingerprintData = sorted.slice(0, 10).map(p => 
        `${p.timestamp}_${p.poolId}_${p.name}_${p.rarity}`
    ).join('|');

    return 'u_' + crypto.createHash('md5').update(fingerprintData).digest('hex');
}

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
app.use(express.json({ limit: '10mb' }));

const GAME_API_URL = 'https://ef-webview.gryphline.com/api/record/char';

const POOL_TYPES = [
    // Персонажи
    "E_CharacterGachaPoolType_Beginner",
    "E_CharacterGachaPoolType_Standard",
    "E_CharacterGachaPoolType_Special",
    // Оружие
    "WEAPON_FETCH_ALL"
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

app.post('/api/import', async (req, res) => {
    const { rawUrl, saveStats } = req.body;
    const startTime = Date.now();
    
    // Валидация домена
    try {
        const parsedUrl = new URL(rawUrl);
        if (!parsedUrl.hostname.endsWith('hg-game.com') && !parsedUrl.hostname.endsWith('gryphline.com')) {
            return res.status(400).json({ error: "Invalid domain" });
        }
        
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

            // Объявляем переменную
            const isWeaponScan = poolType === 'WEAPON_FETCH_ALL';
            
            const currentApiUrl = isWeaponScan 
                ? 'https://ef-webview.gryphline.com/api/record/weapon'
                : 'https://ef-webview.gryphline.com/api/record/char';

            console.log(`\n[Pool] Scanning: ${isWeaponScan ? 'WEAPONS (All)' : mapPoolTypeToShort(poolType)}`);

            while (hasMore) {
                const params = new URLSearchParams({
                    token, lang, server_id: serverId
                });

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
                        console.warn(`⚠️ Game API Error: ${result.code} - ${result.msg}`);
                        hasMore = false; 
                        break; 
                    }

                    const list = result.data?.list || [];
                    
                    // [ИСПРАВЛЕНИЕ ЗДЕСЬ] Используем isWeaponScan
                    const newItems = list.filter(item => {
                        const uniqueKey = (isWeaponScan ? 'w_' : 'c_') + item.seqId;
                        return !visitedIds.has(uniqueKey);
                    });

                    if (list.length > 0 && newItems.length === 0) {
                        hasMore = false;
                        break;
                    }

                    console.log(`  -> Page ${pageCount}: Received ${list.length} items. New: ${newItems.length}`);

                    // [И ТУТ ТОЖЕ]
                    newItems.forEach(item => {
                        const uniqueKey = (isWeaponScan ? 'w_' : 'c_') + item.seqId;
                        visitedIds.add(uniqueKey);
                    });

                    const listWithMeta = newItems.map(item => {
                        let finalPoolId;

                        if (isWeaponScan) {
                            const rawId = item.poolId || item.bannerId;
                            finalPoolId = mapPoolTypeToShort(rawId); 
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

                    allPulls = [...allPulls, ...listWithMeta];
                    
                    hasMore = result.data?.hasMore;
                    if (newItems.length === 0) hasMore = false;
                    else if (list.length > 0) lastId = list[list.length - 1].seqId;
                    else hasMore = false;

                    pageCount++;
                    if (pageCount > 50) hasMore = false;
                    await sleep(100);

                } catch (err) {
                    console.error(`  -> Network/API Error: ${err.message}`);
                    hasMore = false;
                }
            }
        }

        console.log(`--- Import Finished. Total: ${allPulls.length} ---`);

        // Генерация UID
        const stableUid = generateStableUid(allPulls);

        if (!stableUid) {
            return res.status(400).json({ error: "No pulls found to generate UID" });
        }

        console.log(`User Stable UID: ${stableUid}`);

        // Сохранение статистики
        if (prisma && allPulls.length > 0) {
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

    // 1. ПЕРСОНАЖИ
    if (longType.includes('Character')) {
        if (longType.includes('Beginner')) return 'new-player';
        if (longType.includes('Standard')) return 'standard';
        if (longType.includes('Special')) return 'special';
    }
    // Если просто стандартные названия без префикса Character
    if (longType.includes('Beginner')) return 'new-player';
    if (longType.includes('Standard') && !longType.includes('Weapon')) return 'standard';
    if (longType.includes('Special') && !longType.includes('Weapon') && !longType.includes('weponbox')) return 'special';

    // 2. ОРУЖИЕ
    // Типы из конфига или API
    if (longType === 'WEAPON_FETCH_ALL') return 'weapon-all'; // Временный тип
    if (longType.includes('Weapon') && longType.includes('Standard')) return 'weap-standard';
    if (longType.includes('Weapon') && longType.includes('Special')) return 'weap-special';

    // "Сырые" ID из логов оружия
    if (longType.includes('constant')) return 'weap-standard'; // weaponbox_constant_2
    if (longType.includes('weponbox')) return 'weap-special';  // weponbox_1_0_1

    return 'unknown';
}

async function updateAggregatedStats(uid, allPulls) {
    if (!allPulls.length) return;

    // 1. Создаем юзера
    await prisma.user.upsert({ where: { uid }, update: {}, create: { uid } });

    // 2. Группируем крутки по баннерам, чтобы посчитать статы для каждого
    const pullsByBanner = {};

    allPulls.forEach(p => {
        const pullTimeMs = p.timestamp * 1000;

        // Определяем Banner ID
        const matchedBanner = BANNERS.find(b =>
            b.type === p.poolId &&
            pullTimeMs >= b.startTime &&
            (!b.endTime || pullTimeMs <= b.endTime)
        );
        const bannerId = matchedBanner ? matchedBanner.id : p.poolId;

        if (!pullsByBanner[bannerId]) pullsByBanner[bannerId] = [];
        pullsByBanner[bannerId].push({ ...p, time: pullTimeMs });
    });

    // 3. Считаем статистику для каждого баннера и сохраняем
    for (const [bannerId, pulls] of Object.entries(pullsByBanner)) {
        const stats = calculateMath(pulls, bannerId);

        await prisma.userBannerStat.upsert({
            where: {
                uid_bannerId: { uid, bannerId } // Используем составной ключ
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
            },
            create: {
                uid,
                bannerId,
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

    console.log(`[Stats] Updated stats for user ${uid} across ${Object.keys(pullsByBanner).length} banners.`);
}

// Математика подсчета (аналог того, что у тебя на фронте, но упрощено для БД)
function calculateMath(pulls, bannerId) {
    pulls.sort((a, b) => a.time - b.time || a.seqId.localeCompare(b.seqId));

    let bannerConfig = BANNERS.find(b => b.id === bannerId);
    if (!bannerConfig) {
        if (bannerId.includes('new')) bannerConfig = BANNERS.find(b => b.type === 'beginner');
        else if (bannerId.includes('special')) bannerConfig = BANNERS.find(b => b.type === 'special');
        else bannerConfig = BANNERS.find(b => b.type === 'standard');
    }

    const featured6 = (bannerConfig && bannerConfig.featured6) ? bannerConfig.featured6 : [];
    const normalize = s => s ? s.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
    const normFeatured = featured6.map(normalize);

    let stats = {
        totalPulls: pulls.length,
        total6: 0, sumPity6: 0,
        total5: 0, sumPity5: 0,
        won5050: 0, total5050: 0
    };

    let pityCounter = 0;
    let last6WasFeatured = true; 

    pulls.forEach((p) => {
        // [NEW] Проверка бесплатной крутки
        const isFree = p.isFree === true || String(p.isFree) === "true";

        if (!isFree) {
            pityCounter++;
        }

        // [FIX] Rarity 6 для 6-звездочных
        if (p.rarity === 6) { 
            stats.total6++;
            stats.sumPity6 += pityCounter; // Записываем, на каком пити выпало

            if (normFeatured.length > 0) {
                const charName = normalize(p.name);
                const isFeatured = normFeatured.includes(charName);
                if (last6WasFeatured) {
                    stats.total5050++;
                    if (isFeatured) stats.won5050++;
                }
                last6WasFeatured = isFeatured;
            }
            pityCounter = 0; // Сброс
        }
        
        // [FIX] Rarity 5 для 5-звездочных
        else if (p.rarity === 5) { 
            stats.total5++;
        }
    });

    return stats;
}

app.get('/api/rankings/data', async (req, res) => {
    try {
        const { bannerId, uid } = req.query;
        if (!bannerId) return res.status(400).json({ code: 1, message: "Banner ID required" });

        // 1. Получаем статистику этого баннера для ВСЕХ
        // Для оптимизации можно не тащить все поля, а только нужные для сортировки
        const allStats = await prisma.userBannerStat.findMany({
            where: { bannerId },
            select: {
                uid: true,
                totalPulls: true,
                sumPity6: true,
                total6: true,
                won5050: true,
                total5050: true
            }
        });

        if (allStats.length === 0) {
            return res.json({ code: 0, data: { rankTotal: null, rankLuck6: null } });
        }

        // 2. Считаем среднюю удачу для каждого
        const usersWithAvg = allStats.map(s => ({
            ...s,
            avg6: s.total6 > 0 ? s.sumPity6 / s.total6 : 0, // 0 значит "нет лег", ставим в конец
            winRate: s.total5050 > 0 ? (s.won5050 / s.total5050) * 100 : 0
        }));

        // 3. Ищем текущего юзера
        const myStat = usersWithAvg.find(u => u.uid === uid);

        if (!myStat) {
            // Данных по этому юзеру нет, отдаем общую стату
            return res.json({ code: 0, data: { found: false, totalUsers: allStats.length } });
        }

        // 4. Считаем Ранги (Percentile)
        // Функция расчета: Сколько людей ХУЖЕ меня?
        // Rank 99% = я лучше 99% людей (топ 1). Rank 1% = я лох.

        // -- Luck Rank (Меньше пити = лучше) --
        // Сортируем: от маленького пити к большому. Исключаем тех, у кого 0 лег.
        const validLuckUsers = usersWithAvg.filter(u => u.total6 > 0).sort((a, b) => a.avg6 - b.avg6);
        const myLuckIndex = validLuckUsers.findIndex(u => u.uid === uid);
        let rankLuck6 = null;
        if (myLuckIndex !== -1) {
            // Если я на 0 месте (самый везучий), то я лучше 100%
            // Percentile = (Кол-во людей ХУЖЕ меня / Всего) * 100
            // В отсортированном массиве [Лучший, ..., Худший]
            // Люди "хуже меня" - это те, кто после меня (индекс больше)
            const worseThanMe = validLuckUsers.length - 1 - myLuckIndex;
            rankLuck6 = (worseThanMe / validLuckUsers.length * 100).toFixed(0);
        }

        const validLuck5 = usersWithAvg.filter(u => u.total5 > 0).sort((a, b) => a.avg5 - b.avg5); // Сортировка по возрастанию (меньше - лучше)
        const myLuck5Index = validLuck5.findIndex(u => u.uid === uid);
        let rankLuck5 = null;
        if (myLuck5Index !== -1) {
            const worseThanMe = validLuck5.length - 1 - myLuck5Index;
            rankLuck5 = (worseThanMe / validLuck5.length * 100).toFixed(0);
        }

        // -- Total Pulls Rank (Больше = выше) --
        const sortedTotal = [...usersWithAvg].sort((a, b) => b.totalPulls - a.totalPulls);
        const myTotalIndex = sortedTotal.findIndex(u => u.uid === uid);
        const rankTotal = ((sortedTotal.length - 1 - myTotalIndex) / sortedTotal.length * 100).toFixed(0);

        // -- 50/50 Rank (Больше = выше) --
        const valid5050 = usersWithAvg.filter(u => u.total5050 > 0).sort((a, b) => b.winRate - a.winRate);
        const my5050Index = valid5050.findIndex(u => u.uid === uid);
        let rank5050 = null;
        if (my5050Index !== -1) {
            rank5050 = ((valid5050.length - 1 - my5050Index) / valid5050.length * 100).toFixed(0);
        }

        res.json({
            code: 0,
            data: {
                found: true,
                totalUsers: allStats.length,
                rankTotal,  // "Вы крутили больше, чем X% игроков"
                rankLuck6,
                rankLuck5,  // "Вы удачливее, чем X% игроков"
                rank5050,   // "Вы выигрываете 50/50 чаще, чем X% игроков"

                // Сырые данные тоже можно вернуть
                myStats: {
                    total: myStat.totalPulls,
                    avg6: myStat.avg6.toFixed(1),
                    avg5: myStat.avg5 ? myStat.avg5.toFixed(1) : "0.0",
                    winRate: myStat.winRate.toFixed(1)
                }
            }
        });

    } catch (e) {
        console.error("Rankings Error:", e);
        res.status(500).json({ code: 500, message: "Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on ${PORT}`);
});