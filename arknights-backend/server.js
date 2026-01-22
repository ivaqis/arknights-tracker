const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { URL, URLSearchParams } = require('url');

const app = express();
let prisma;
try {
    prisma = new PrismaClient();
} catch (e) {
    console.warn("Prisma Client not initialized.");
}

const PORT = 3001;

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

                // [FIX] ИСПРАВЛЕНО: используем seq_id вместо last_id
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
                    
                    // Фильтруем дубликаты (защита на случай странностей API)
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
                        // Берем seqId последнего элемента, чтобы запросить следующую страницу
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

        console.log(`\n--- Import Finished ---`);
        console.log(`Total unique pulls: ${allPulls.length}`);

        // Сохранение статистики (если БД подключена)
        if (saveStats && prisma && allPulls.length > 0) {
            const pseudoUid = "u_" + token.substring(0, 15);
            updateGlobalStatsBatch(pseudoUid, allPulls)
                .catch(e => console.error("Stats update failed:", e.message));
        }

        res.json({ code: 0, data: { list: allPulls } });

    } catch (error) {
        console.error("Critical Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

function mapPoolTypeToShort(longType) {
    if (longType.includes('Beginner')) return 'beginner';
    if (longType.includes('Standard')) return 'standard';
    if (longType.includes('Special')) return 'special';
    return 'unknown';
}

async function updateGlobalStatsBatch(uid, allPulls) {
    try {
        await prisma.user.upsert({ where: { uid }, update: {}, create: { uid } });

        const pools = ['beginner', 'standard', 'special'];
        for (const type of pools) {
            const pullsOfType = allPulls.filter(p => p.poolId === type);
            if (pullsOfType.length === 0) continue;

            const sixStars = pullsOfType.filter(p => p.rarity === 6).length;
            const total = pullsOfType.length;
            const avgPity = sixStars > 0 ? (total / sixStars) : 0; 

            // Считаем 50/50 (очень упрощенно, для примера)
            // В реальности нужно чекать total5050Count и won5050Count через логику isWin
            // Но пока просто обновим общие цифры
            
            await prisma.userStat.upsert({
                where: { uid_poolType: { uid, poolType: type } },
                update: {
                    totalPulls: total,
                    avgPity6: avgPity,
                    // Добавьте сюда обновление полей 50/50 если реализовали их в parseGachaLog
                },
                create: {
                    uid, poolType: type,
                    totalPulls: total,
                    avgPity6: avgPity
                }
            });
        }
    } catch (e) {
        console.error("DB Error:", e.message);
    }
}

app.listen(PORT, () => {
    console.log(`Backend running on ${PORT}`);
});