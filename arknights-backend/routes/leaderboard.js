const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const leaderboardCache = {}; // Key: eventType, Value: { data, expiry }
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

router.get('/', async (req, res) => {
    const eventType = req.query.event_type || 'contract';
    const now = Date.now();
    if (leaderboardCache[eventType] && now < leaderboardCache[eventType].expiry) {
        console.log(`[Leaderboard Cache] Serving from cache for event type: ${eventType}`);
        return res.json({ status: 'success', data: leaderboardCache[eventType].data });
    }

    try {
        console.log(`[Leaderboard DB Query] Fetching leaderboard for event type: ${eventType}`);
        
        const entries = await prisma.userLeaderboard.findMany({
            where: {
                event_type: eventType,
                account_detail: {
                    user: {
                        is_private: 0
                    }
                }
            },
            orderBy: { clear_time: 'asc' },
            include: {
                account_detail: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                picture: true,
                                avatar_strike: true,
                                is_private: true,
                                updated_at: true
                            }
                        }
                    }
                }
            }
        });

        const formatted = entries.map(entry => {
            let accountInfo = {};
            try {
                accountInfo = JSON.parse(entry.account_detail.account_info);
            } catch (e) {
                console.warn(`Failed to parse account_info JSON for game_uid: ${entry.game_uid}`);
            }

            let leaderboardInfo = {};
            try {
                leaderboardInfo = JSON.parse(entry.leaderboard_info);
            } catch (e) {
                // Ignore
            }

            return {
                id: entry.id,
                game_uid: entry.game_uid,
                clear_time: entry.clear_time,
                user: {
                    name: entry.account_detail.user.name || "Operator",
                    picture: entry.account_detail.user.picture,
                    avatar_strike: entry.account_detail.user.avatar_strike,
                    updatedAt: entry.account_detail.user.updated_at
                },
                level: accountInfo.detail?.base?.level || accountInfo.base?.level || 1,
                serverId: accountInfo.detail?.base?.serverId || accountInfo.base?.serverId || '3',
                chars: (leaderboardInfo?.chars || accountInfo.detail?.chars || accountInfo.chars || []).slice(0, 4).map(c => ({
                    id: c.id,
                    level: c.level,
                    rarity: c.rarity || (c.charData?.rarity ? Number(c.charData.rarity.value) : 4),
                    weapon: c.weapon ? { id: c.weapon.id, level: c.weapon.level, refineLevel: c.weapon.refineLevel } : null
                })),
                updatedAt: entry.account_detail.user.updated_at,
                contractLevel: Number(leaderboardInfo?.level || accountInfo.contract?.level || 0)
            };
        });

        formatted.sort((a, b) => {
            if (b.contractLevel !== a.contractLevel) {
                return b.contractLevel - a.contractLevel;
            }
            if (a.clear_time !== b.clear_time) {
                return a.clear_time - b.clear_time;
            }
            return a.id - b.id;
        });

        leaderboardCache[eventType] = {
            data: formatted,
            expiry: now + CACHE_DURATION_MS
        };

        res.json({ status: 'success', data: formatted });
    } catch (e) {
        console.error("[Leaderboard API Error]:", e.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/run/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const entry = await prisma.userLeaderboard.findUnique({
            where: { id: Number(id) }
        });
        if (!entry) {
            return res.status(404).json({ error: 'Run record not found' });
        }
        let leaderboardInfo = {};
        try {
            leaderboardInfo = JSON.parse(entry.leaderboard_info);
        } catch (e) {
            console.warn(`Failed to parse leaderboard_info for run ${id}`);
        }
        res.json({ status: 'success', data: leaderboardInfo });
    } catch (e) {
        console.error("[Leaderboard Run API Error]:", e.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.clearCache = function() {
    console.log("[Leaderboard Cache] Clearing all entries from memory");
    for (const key in leaderboardCache) {
        delete leaderboardCache[key];
    }
};

module.exports = router;
