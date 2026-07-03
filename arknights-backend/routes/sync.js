const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyFirebaseIdToken } = require('../authHelper');
const { checkNsfw, saveWebpImage, UPLOADS_DIR } = require('../imageHelper');
const axios = require('axios');
const crypto = require('crypto');
const leaderboardRouter = require('./leaderboard');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

let bannedWords = new Set();
let bannedRoots = [];

async function loadBannedWords() {
    const listPath = path.join(__dirname, '../banned_words.txt');
    const localPath = path.join(__dirname, '../banned_words_local.txt');
    const rootsPath = path.join(__dirname, '../banned_roots.txt'); // Путь к новому файлу

    if (!fs.existsSync(listPath)) {
        try {
            const res = await axios.get('https://raw.githubusercontent.com/censor-text/profanity-list/main/list/en.txt');
            fs.writeFileSync(listPath, res.data);
        } catch (e) {
            console.error(e.message);
        }
    }

    try {
        if (fs.existsSync(listPath)) {
            const data = fs.readFileSync(listPath, 'utf8');
            data.split(/\r?\n/).forEach(w => {
                const trimmed = w.trim().toLowerCase();
                if (trimmed) bannedWords.add(trimmed);
            });
        }
        if (fs.existsSync(localPath)) {
            const data = fs.readFileSync(localPath, 'utf8');
            data.split(/\r?\n/).forEach(w => {
                const trimmed = w.trim().toLowerCase();
                if (trimmed) bannedWords.add(trimmed);
            });
        }
        if (fs.existsSync(rootsPath)) {
            const data = fs.readFileSync(rootsPath, 'utf8');
            data.split(/\r?\n/).forEach(w => {
                const trimmed = w.trim().toLowerCase();
                if (trimmed) bannedRoots.push(trimmed);
            });
        }
    } catch (e) {
        console.error(e.message);
    }
}
loadBannedWords();

function checkProfanity(name) {
    if (!name) return false;
    
    const lowerName = name.toLowerCase();

    const normalized = lowerName
        .replace(/1/g, 'i')
        .replace(/3/g, 'e')
        .replace(/4/g, 'a')
        .replace(/0/g, 'o')
        .replace(/@/g, 'a')
        .replace(/5/g, 's');

    for (const root of bannedRoots) {
        if (normalized.includes(root)) {
            return true;
        }
    }

    const tokens = normalized.split(/[^a-z]+/);
    for (const token of tokens) {
        if (!token) continue;
        
        if (bannedWords.has(token)) {
            return true;
        }

        for (const word of bannedWords) {
            if (word.length >= 4 && token.includes(word)) {
                return true;
            }
        }
    }

    return false;
}

function generateSign(path, query, timestamp, token) {
    const headerCa = JSON.stringify({ platform: "3", timestamp: timestamp, dId: "", vName: "1.0.0" });
    const strToSign = `${path}${query}${timestamp}${headerCa}`;
    const hmacSha256 = crypto.createHmac('sha256', token)
                             .update(strToSign)
                             .digest('hex');
    return crypto.createHash('md5')
                 .update(hmacSha256)
                 .digest('hex');
}

router.post('/profile', async (req, res) => {
    console.log("[POST /profile] received req.body:", req.body);
    const { idToken, name, picture, is_private, background, game_uid, records_uid } = req.body;
    try {
        const payload = await verifyFirebaseIdToken(idToken);
        const firebaseUid = payload.sub;

        const updateData = {
            updated_at: new Date()
        };
        let trimmedName = undefined;
        if (name !== undefined) {
            trimmedName = name.trim();
            if (trimmedName.length < 3 || trimmedName.length > 20) {
                return res.status(400).json({ error: "Username must be between 3 and 20 characters long." });
            }
            if (!/^[a-zA-Z0-9_]+$/.test(trimmedName)) {
                return res.status(400).json({ error: "Username can only contain English letters, numbers, and underscores." });
            }
            if (checkProfanity(trimmedName)) {
                return res.status(400).json({ error: "Username contains inappropriate language." });
            }
            updateData.name = trimmedName;
        }
        if (is_private !== undefined) updateData.is_private = Number(is_private);
        if (picture !== undefined) updateData.picture = picture;
        if (background !== undefined) {
            if (background === null || background === "") {
                updateData.background = null;
            } else if (/^[a-zA-Z0-9_]+_potential[135]$/.test(background)) {
                updateData.background = background;
            } else {
                return res.status(400).json({ error: "Invalid background format." });
            }
        }

        const userAccount = await prisma.userAccount.upsert({
            where: { firebase_uid: firebaseUid },
            update: updateData,
            create: {
                firebase_uid: firebaseUid,
                name: trimmedName || payload.name || "Operator",
                picture: picture || null,
                is_private: is_private !== undefined ? Number(is_private) : 0,
                background: (background && /^[a-zA-Z0-9_]+_potential[135]$/.test(background)) ? background : null
            }
        });

        if (game_uid && records_uid !== undefined) {
            const dbGameAcc = await prisma.userAccountDetails.findUnique({
                where: { game_uid: String(game_uid) }
            });
            if (dbGameAcc) {
                if (dbGameAcc.user_id !== userAccount.id) {
                    return res.status(403).json({ error: "Unauthorized: Game account belongs to another user." });
                }
                await prisma.userAccountDetails.update({
                    where: { game_uid: String(game_uid) },
                    data: {
                        records_uid: (records_uid && records_uid !== "") ? String(records_uid).trim() : null
                    }
                });
            }
        }

        if (is_private !== undefined) {
            leaderboardRouter.clearCache();
        }

        const fullUserAccount = await prisma.userAccount.findUnique({
            where: { id: userAccount.id },
            include: { details: true }
        });

        res.json({ status: 'success', data: fullUserAccount });
    } catch (e) {
        console.error("[Profile API Error]:", e.message);
        res.status(400).json({ error: e.message });
    }
});

router.get('/profile/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
        const userAccount = await prisma.userAccount.findUnique({
            where: { firebase_uid: uid },
            include: { details: true }
        });

        if (!userAccount) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({ status: 'success', data: userAccount });
    } catch (e) {
        console.error("[Profile API Error]:", e.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/sync', async (req, res) => {
    const { idToken, gameToken, testRecords, serverId } = req.body;
    try {
        const payload = await verifyFirebaseIdToken(idToken);
        const firebaseUid = payload.sub;

        const userAccount = await prisma.userAccount.findUnique({
            where: { firebase_uid: firebaseUid }
        });
        if (!userAccount) {
            return res.status(400).json({ error: "Profile not registered. Please register a profile first." });
        }

        const SYNC_COOLDOWN = 7 * 60 * 1000;
        const now = Date.now();
        const lastUpdated = new Date(userAccount.updated_at).getTime();
        
        if (false && !testRecords && (now - lastUpdated < SYNC_COOLDOWN)) {
            const timeRemaining = Math.ceil((SYNC_COOLDOWN - (now - lastUpdated)) / 1000 / 60);
            return res.status(429).json({ 
                error: `Sync is on cooldown. Please wait ${timeRemaining} minutes before trying again.` 
            });
        }

        let syncedAccounts = [];

        if (testRecords) {
            syncedAccounts = testRecords;
        } else {
            let tokenToUse = gameToken.trim();
            if (tokenToUse.startsWith('{') && tokenToUse.endsWith('}')) {
                try {
                    const parsed = JSON.parse(tokenToUse);
                    if (parsed.data && parsed.data.content) {
                        tokenToUse = parsed.data.content.trim();
                    } else if (parsed.content) {
                        tokenToUse = parsed.content.trim();
                    }
                } catch (err) {
                    console.error("[Sync API Token Parse Warning]: Failed to parse token as JSON:", err.message);
                }
            }

            const grantRes = await axios.post(
                process.env.GRYPHLINE_AUTH_URL,
                { token: tokenToUse, appCode: "6eb76d4e13aa36e6", type: 0 },
                { headers: { "Content-Type": "application/json" } }
            );

            if (grantRes.data.status !== 0) {
                console.error("[Sync API Grant Error]: Failed to fetch grant code from Gryphline API. Response data:", grantRes.data);
                return res.status(400).json({ error: "Invalid or expired game token." });
            }

            const credRes = await axios.post(
                process.env.SKPORT_CRED_URL,
                { kind: 1, code: grantRes.data.data.code },
                { headers: { "Content-Type": "application/json" } }
            );

            const { cred, token } = credRes.data.data;
            const ts = String(Math.floor(Date.now() / 1000));
            const bindPath = process.env.SKPORT_BIND_PATH;
            const sign = generateSign(bindPath, "", ts, token);

            const bindRes = await axios.get(
                `${process.env.SKPORT_BASE_URL}${bindPath}`,
                {
                    headers: {
                        "Accept": "application/json", "cred": cred, "sign": sign,
                        "platform": "3", "timestamp": ts, "vname": "1.0.0", "dId": "",
                        "sk-language": "ru_RU",
                        "User-Agent": "Mozilla/5.0"
                    }
                }
            );

            console.log("[Sync API Bindings Received]:", JSON.stringify(bindRes.data, null, 2));

            if (bindRes.data.code !== 0) {
                console.error("[Sync API Binding Error]: Failed to fetch binding list. Response data:", bindRes.data);
                return res.status(400).json({ error: `Game binding query failed: ${bindRes.data.msg}` });
            }

            const gamesList = bindRes.data.data?.list || [];
            const accountsToTry = [];
            
            for (const game of gamesList) {
                for (const acc of (game.bindingList || [])) {
                    const roles = acc.roles || [];
                    if (roles.length > 0) {
                        for (const role of roles) {
                            accountsToTry.push({
                                role_id: String(role.roleId),
                                server_id: String(role.serverId || role.channelMasterId || '3'),
                                game_name: game.appName || 'Unknown'
                            });
                        }
                    } else {
                        accountsToTry.push({
                            role_id: String(acc.uid),
                            server_id: '3',
                            game_name: game.appName || 'Unknown'
                        });
                    }
                }
            }

            let filteredAccounts = accountsToTry;
            if (serverId && serverId !== 'both') {
                filteredAccounts = accountsToTry.filter(acc => acc.server_id === String(serverId));
            }

            for (const acc of filteredAccounts) {
                const ts = String(Math.floor(Date.now() / 1000));
                const rosPath = process.env.SKPORT_DETAIL_PATH;
                const query = `roleId=${acc.role_id}&serverId=${acc.server_id}`;
                
                const rosHeaders = {
                    "Accept": "application/json", "cred": cred,
                    "sign": generateSign(rosPath, query, ts, token),
                    "platform": "3", "timestamp": ts, "vname": "1.0.0", "sk-language": "ru_RU",
                    "User-Agent": "Mozilla/5.0"
                };

                const rosRes = await axios.get(
                    `${process.env.SKPORT_BASE_URL}${rosPath}?${query}`,
                    { headers: rosHeaders }
                );

                console.log("[Sync API Detail for UID ...]:", JSON.stringify(rosRes.data, null, 2));

                if (rosRes.data.code === 0) {
                    const detail = rosRes.data.data;
                    
                    let contractDetail = null;
                    const realDetail = detail.detail || detail;
                    const contractId = realDetail.crisisContract?.[0]?.id;
                    if (contractId) {
                        const ccTs = String(Math.floor(Date.now() / 1000));
                        const ccPath = process.env.SKPORT_CC_PATH;
                        const ccQuery = `roleId=${acc.role_id}&serverId=${acc.server_id}&userId=&contractId=${contractId}`;
                        const ccHeaders = {
                            "Accept": "application/json", "cred": cred,
                            "sign": generateSign(ccPath, ccQuery, ccTs, token),
                            "platform": "3", "timestamp": ccTs, "vname": "1.0.0", "sk-language": "ru_RU",
                            "User-Agent": "Mozilla/5.0"
                        };
                        try {
                            const ccRes = await axios.get(
                                `${process.env.SKPORT_BASE_URL}${ccPath}?${ccQuery}`,
                                { headers: ccHeaders }
                            );
                            if (ccRes.data.code === 0) {
                                contractDetail = ccRes.data.data?.crisisContract;
                                console.log("[Sync API Crisis Contract Detailed Info Loaded]:", JSON.stringify(contractDetail, null, 2));
                                const recordId = contractDetail?.history?.bestRecord?.id;
                                if (recordId) {
                                    const recTs = String(Math.floor(Date.now() / 1000));
                                    const recPath = process.env.SKPORT_CC_REC_PATH;
                                    const recQuery = `roleId=${acc.role_id}&serverId=${acc.server_id}&userId=&contractId=${contractId}&recordId=${recordId}`;
                                    const recHeaders = {
                                        "Accept": "application/json",
                                        "cred": cred,
                                        "sign": generateSign(recPath, recQuery, recTs, token),
                                        "platform": "3",
                                        "timestamp": recTs,
                                        "vname": "1.0.0",
                                        "sk-language": "ru_RU",
                                        "User-Agent": "Mozilla/5.0"
                                    };
                                    try {
                                        const recRes = await axios.get(
                                            `${process.env.SKPORT_BASE_URL}${recPath}?${recQuery}`,
                                            { headers: recHeaders }
                                        );
                                        console.log("[Sync API Crisis Contract Record Detail Response]:", JSON.stringify(recRes.data, null, 2));
                                        if (recRes.data.code === 0 && recRes.data.data?.recordDetail) {
                                            contractDetail.bestRecordDetail = recRes.data.data.recordDetail;
                                            console.log("[Sync API Crisis Contract Record Detail Loaded]");
                                        }
                                    } catch (recErr) {
                                        console.error("[Sync API Crisis Contract Record Detail Fetch Error]:", recErr.message);
                                    }
                                }
                            }
                        } catch (err) {
                            console.error("[Sync API Crisis Contract Fetch Error]:", err.message);
                        }
                    }

                    syncedAccounts.push({
                        game_uid: acc.role_id,
                        server_id: acc.server_id,
                        account_info: detail,
                        contract_detail: contractDetail
                    });
                } else {
                    console.error(`[Sync API Detail Error]: Failed to fetch card details for UID ${acc.role_id}. Response data:`, rosRes.data);
                }
            }
        }

        if (syncedAccounts.length === 0) {
            console.error("[Sync API Sync Error]: No accounts were successfully synced or fetched.");
            return res.status(400).json({ error: "No game accounts found or failed to fetch their details." });
        }

        for (const synced of syncedAccounts) {
            const existingDetail = await prisma.userAccountDetails.findUnique({
                where: { game_uid: synced.game_uid },
                include: { user: true }
            });

            if (existingDetail && existingDetail.user.firebase_uid !== firebaseUid) {
                return res.status(403).json({ 
                    error: `Game UID ${synced.game_uid} is already linked to another user account.` 
                });
            }

            const normalizedInfo = normalizeGameAccountInfo(synced.account_info, synced.server_id, synced.contract_detail);
            const detailRecord = await prisma.userAccountDetails.upsert({
                where: { game_uid: synced.game_uid },
                update: {
                    account_info: JSON.stringify(normalizedInfo)
                },
                create: {
                    user_id: userAccount.id,
                    game_uid: synced.game_uid,
                    account_info: JSON.stringify(normalizedInfo)
                }
            });

            const detailsJson = normalizedInfo;
            
            let clearTime = null;
            let leaderboardInfo = {};
            let eventType = "contract";

            if (detailsJson.contract || (detailsJson.detail && detailsJson.detail.contract)) {
                const c = detailsJson.contract || detailsJson.detail.contract;
                clearTime = parseFloat(c.clearTime || c.costTime || c.time);
                leaderboardInfo = c;
            } else if (detailsJson.clearTime) {
                clearTime = parseFloat(detailsJson.clearTime);
                leaderboardInfo = detailsJson.leaderboardInfo || {};
                eventType = detailsJson.eventType || "contract";
            }

            if (clearTime !== null && !isNaN(clearTime) && clearTime > 0) {
                const existingLeaderboard = await prisma.userLeaderboard.findFirst({
                    where: {
                        game_uid: synced.game_uid,
                        event_type: eventType
                    }
                });

                if (existingLeaderboard) {
                    await prisma.userLeaderboard.update({
                        where: { id: existingLeaderboard.id },
                        data: {
                            clear_time: clearTime,
                            leaderboard_info: JSON.stringify(leaderboardInfo)
                        }
                    });
                } else {
                    await prisma.userLeaderboard.create({
                        data: {
                            game_uid: synced.game_uid,
                            event_type: eventType,
                            clear_time: clearTime,
                            leaderboard_info: JSON.stringify(leaderboardInfo)
                        }
                    });
                }
            }
        }

        await prisma.userAccount.update({
            where: { id: userAccount.id },
            data: { updated_at: new Date() }
        });

        const allDetails = await prisma.userAccountDetails.findMany({
            where: { user_id: userAccount.id }
        });

        res.json({
            status: 'success',
            game_accounts: allDetails.map(d => ({
                game_uid: d.game_uid,
                account_info: JSON.parse(d.account_info)
            }))
        });

    } catch (e) {
        console.error("[Sync API Error]:", e.message);
        if (e.response) {
            console.error("[Sync API Axios Response Error]: Status:", e.response.status, "Data:", JSON.stringify(e.response.data));
        } else if (e.request) {
            console.error("[Sync API Axios Request Error]: No response received from target server.");
        }
        res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
});

router.post('/upload-avatar', async (req, res) => {
    const { idToken, image, filename } = req.body;
    try {
        const payload = await verifyFirebaseIdToken(idToken);
        const firebaseUid = payload.sub;

        const userAccount = await prisma.userAccount.findUnique({
            where: { firebase_uid: firebaseUid }
        });

        if (!userAccount) {
            return res.status(400).json({ error: "Profile not found. Register first." });
        }

        const now = new Date();
        const resetDate = new Date(userAccount.last_upload_reset);
        let uploadCount = userAccount.upload_count;
        let mustReset = false;

        if (now.getFullYear() !== resetDate.getFullYear() || now.getMonth() !== resetDate.getMonth()) {
            uploadCount = 0;
            mustReset = true;
        }

        if (uploadCount >= 30) {
            return res.status(429).json({ error: "Monthly upload limit reached (max 30 uploads per month)." });
        }

        const isNsfw = await checkNsfw(image, filename || '');
        if (isNsfw) {
            await prisma.userAccount.update({
                where: { id: userAccount.id },
                data: {
                    avatar_strike: 1,
                    upload_count: uploadCount + 1,
                    last_upload_reset: mustReset ? now : resetDate
                }
            });

            return res.json({
                status: 'success',
                nsfw: true,
                avatar_strike: 1,
                message: "Image rejected due to content policy. Image is preserved in local browser cache only."
            });
        }

        const fileId = await saveWebpImage(image);

        if (userAccount.picture && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(userAccount.picture)) {
            const oldPath = path.join(UPLOADS_DIR, `${userAccount.picture}.webp`);
            if (fs.existsSync(oldPath)) {
                try {
                    fs.unlinkSync(oldPath);
                    console.log(`[Upload API] Deleted old avatar file: ${oldPath}`);
                } catch (err) {
                    console.error(`[Upload API Error] Failed to delete old avatar file ${oldPath}:`, err.message);
                }
            }
        }

        const updated = await prisma.userAccount.update({
            where: { id: userAccount.id },
            data: {
                picture: fileId,
                upload_count: uploadCount + 1,
                last_upload_reset: mustReset ? now : resetDate,
                avatar_strike: 0
            }
        });

        res.json({
            status: 'success',
            nsfw: false,
            picture: fileId,
            data: updated
        });

    } catch (e) {
        console.error("[Upload API Error]:", e.message);
        res.status(400).json({ error: e.message });
    }
});

router.delete('/game-account/:game_uid', async (req, res) => {
    const { game_uid } = req.params;
    const { idToken } = req.body;
    try {
        const payload = await verifyFirebaseIdToken(idToken);
        const firebaseUid = payload.sub;

        const userAccount = await prisma.userAccount.findUnique({
            where: { firebase_uid: firebaseUid }
        });
        if (!userAccount) {
            return res.status(400).json({ error: "Profile not found." });
        }

        const existingDetail = await prisma.userAccountDetails.findUnique({
            where: { game_uid: game_uid }
        });
        if (!existingDetail) {
            return res.status(404).json({ error: "Game account not found." });
        }

        if (existingDetail.user_id !== userAccount.id) {
            return res.status(403).json({ error: "You do not own this game account." });
        }

        await prisma.userAccountDetails.delete({
            where: { game_uid: game_uid }
        });

        leaderboardRouter.clearCache();

        res.json({ status: 'success', message: "Game account successfully unlinked." });
    } catch (e) {
        console.error("[Delete Game Account Error]:", e.message);
        res.status(400).json({ error: e.message });
    }
});

router.get('/profile-by-name/:name', async (req, res) => {
    const { name } = req.params;
    try {
        let userAccount = await prisma.userAccount.findFirst({
            where: { name: name },
            include: { details: true }
        });

        if (!userAccount) {
            const allMatches = await prisma.userAccount.findMany({
                where: {
                    name: {
                        startsWith: name
                    }
                },
                include: { details: true }
            });
            userAccount = allMatches.find(u => u.name && u.name.toLowerCase() === name.toLowerCase());
        }

        if (!userAccount) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        if (userAccount.is_private === 1) {
            return res.status(403).json({ error: 'This profile is private' });
        }

        res.json({ status: 'success', data: userAccount });
    } catch (e) {
        console.error("[Profile API Error]:", e.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const nameScoreToTagId = {
    "Среда: разгон_3": "activity_contract_tag_201",
    "Изменение: азарт_1": "activity_contract_tag_101",
    "Изменение: азарт_2": "activity_contract_tag_102",
    "Команда: боевой озноб_1": "activity_contract_tag_203",
    "Команда: боевой озноб_2": "activity_contract_tag_204",
    "Команда: потеря тепла_1": "activity_contract_tag_205",
    "Команда: потеря тепла_2": "activity_contract_tag_206",
    "Команда: гнутые края_1": "activity_contract_tag_207",
    "Команда: гнутые края_2": "activity_contract_tag_208",
    "Команда: обезглавливание_1": "activity_contract_tag_117",
    "Команда: обезглавливание_2": "activity_contract_tag_118",
    "Команда: слабая основа_3": "activity_contract_tag_209",
    "Команда: сдержанность_1": "activity_contract_tag_122",
    "Команда: сдержанность_2": "activity_contract_tag_123",
    "Изменение: защитный эффект_1": "activity_contract_tag_124",
    "Изменение: восстановление_1": "activity_contract_tag_119",
    "Изменение: восстановление_2": "activity_contract_tag_120",
    "Среда: разделение_2": "activity_contract_tag_125",
    "Среда: гипоксия_1": "activity_contract_tag_103",
    "Среда: трясина_3": "activity_contract_tag_104",
    "Команда: утомление_3": "activity_contract_tag_127",
    "Изменение: токсичные отходы_1": "activity_contract_tag_129",
    "Изменение: токсичные отходы_2": "activity_contract_tag_130",
    "Изменение: шоковая заморозка_2": "activity_contract_tag_135",
    "Среда: термораспад_1": "activity_contract_tag_132",
    "Среда: биораспад_1": "activity_contract_tag_133",
    "Среда: электрораспад_1": "activity_contract_tag_134",
    "Среда: увядание_1": "activity_contract_tag_107",
    "Среда: увядание_2": "activity_contract_tag_108",
    "Среда: ограниченное время_1": "activity_contract_tag_111_2",
    "Среда: ограниченное время_2": "activity_contract_tag_112_2",
    "Среда: ограниченное время_3": "activity_contract_tag_301",
    "Среда: реконструкция_2": "activity_contract_tag_310",
    "Среда: реконструкция_3": "activity_contract_tag_311",
    "Изменение: натиск_2": "activity_contract_tag_136",
    "Среда: физиораспад_1": "activity_contract_tag_210",
    "Команда: слабость_1": "activity_contract_tag_302",
    "Команда: слабость_2": "activity_contract_tag_303",
    "Команда: слабость_3": "activity_contract_tag_304",
    "Изменение: охват_1": "activity_contract_tag_308",
    "Среда: дрожь_3": "activity_contract_tag_306",
    "Среда: синхронизированный рост_2": "activity_contract_tag_307",
    "Команда: отягощение_1": "activity_contract_tag_312",
    "Изменение: жизнеспособность_1": "activity_contract_tag_114",
    "Изменение: жизнеспособность_2": "activity_contract_tag_115",
    "Изменение: жизнеспособность_3": "activity_contract_tag_116"
};

const nameToTagId = {};
for (const key in nameScoreToTagId) {
    const nameOnly = key.substring(0, key.lastIndexOf("_"));
    if (nameOnly && !nameToTagId[nameOnly]) {
        nameToTagId[nameOnly] = nameScoreToTagId[key];
    }
}

function normalizeGameAccountInfo(rawInfo, serverId, contractDetail) {
    if (rawInfo && rawInfo.base && rawInfo.stats && !contractDetail) {
        return rawInfo;
    }
    const detail = rawInfo.detail || rawInfo;
    const base = detail.base || {};
    const dungeon = detail.dungeon || {};
    const bpSystem = detail.bpSystem || {};
    const dailyMission = detail.dailyMission || {};
    const weeklyMission = detail.weeklyMission || {};
    const crisisContractList = detail.crisisContract || [];

    let awakeDay = 0;
    if (base.saveTime && base.createTime) {
        const diffSeconds = Number(base.saveTime) - Number(base.createTime);
        awakeDay = Math.max(1, Math.floor(diffSeconds / 86400));
    }

    const mappedChars = (detail.chars || []).map(c => {
        return {
            id: c.charData?.id || c.id,
            name: c.charData?.name || c.name || "Operator",
            level: c.level || 1,
            potentialLevel: c.potentialLevel || 0,
            potential: (c.potentialLevel !== undefined ? c.potentialLevel + 1 : (c.potential || 1)),
            charData: c.charData
        };
    });

    let contractLevel = 0;
    let contractClearTime = 0;
    let contractChars = [];
    let contractIndicators = [];

    if (contractDetail) {
        contractLevel = contractDetail.status?.highest || 0;
        const bestRecord = contractDetail.history?.bestRecord;
        if (bestRecord && bestRecord.isPass) {
            contractClearTime = parseFloat(bestRecord.passTs) || 0;
            let baseIndicators = [];
            const selectedIds = contractDetail.bestRecordDetail?.indicatorIds || bestRecord.indicatorIds;
            if (selectedIds && Array.isArray(selectedIds)) {
                const idSet = new Set(selectedIds);
                baseIndicators = (contractDetail.indicators || []).filter(ind => idSet.has(ind.id));
            } else {
                baseIndicators = contractDetail.bestRecordDetail?.indicators || bestRecord.indicators || contractDetail.indicators || [];
            }

            contractIndicators = baseIndicators.map(ind => {
                const name = ind.name || "";
                const score = ind.score || 1;
                const lookupKey = `${name}_${score}`;
                const tagId = nameScoreToTagId[lookupKey] || nameToTagId[name] || ind.id || "";
                return {
                    id: tagId,
                    icon: ind.icon || "",
                    name: name,
                    desc: ind.desc || ""
                };
            });
            const detailCharsList = contractDetail.bestRecordDetail?.chars || bestRecord.chars || [];
            contractChars = detailCharsList.map(c => {
                const rosterChar = mappedChars.find(rc => rc.id === c.charId);
                return {
                    id: c.charId,
                    name: rosterChar ? rosterChar.name : "Operator",
                    level: c.level || 1,
                    potentialLevel: c.potentialLevel || 0,
                    potential: c.potentialLevel + 1,
                    weapon: c.weapon ? {
                        id: c.weapon.id,
                        icon: c.weapon.icon,
                        level: c.weapon.level,
                        refineLevel: c.weapon.refineLevel,
                        rarity: c.weapon.rarity && typeof c.weapon.rarity === 'object' ? Number(c.weapon.rarity.value) : c.weapon.rarity,
                        weaponTerms: c.weapon.weaponTerms || []
                    } : null,
                    equips: c.equips ? {
                        bodyEquip: c.equips.bodyEquip ? {
                            id: c.equips.bodyEquip.id,
                            icon: c.equips.bodyEquip.icon,
                            enhanceStatus: c.equips.bodyEquip.enhanceStatus,
                            rarity: c.equips.bodyEquip.rarity && typeof c.equips.bodyEquip.rarity === 'object' ? Number(c.equips.bodyEquip.rarity.value) : c.equips.bodyEquip.rarity
                        } : null,
                        armEquip: c.equips.armEquip ? {
                            id: c.equips.armEquip.id,
                            icon: c.equips.armEquip.icon,
                            enhanceStatus: c.equips.armEquip.enhanceStatus,
                            rarity: c.equips.armEquip.rarity && typeof c.equips.armEquip.rarity === 'object' ? Number(c.equips.armEquip.rarity.value) : c.equips.armEquip.rarity
                        } : null,
                        firstAccessory: c.equips.firstAccessory ? {
                            id: c.equips.firstAccessory.id,
                            icon: c.equips.firstAccessory.icon,
                            enhanceStatus: c.equips.firstAccessory.enhanceStatus,
                            rarity: c.equips.firstAccessory.rarity && typeof c.equips.firstAccessory.rarity === 'object' ? Number(c.equips.firstAccessory.rarity.value) : c.equips.firstAccessory.rarity
                        } : null,
                        secondAccessory: c.equips.secondAccessory ? {
                            id: c.equips.secondAccessory.id,
                            icon: c.equips.secondAccessory.icon,
                            enhanceStatus: c.equips.secondAccessory.enhanceStatus,
                            rarity: c.equips.secondAccessory.rarity && typeof c.equips.secondAccessory.rarity === 'object' ? Number(c.equips.secondAccessory.rarity.value) : c.equips.secondAccessory.rarity
                        } : null
                    } : null,
                    charData: rosterChar ? rosterChar.charData : {
                        id: c.charId,
                        name: "Operator",
                        avatarSqUrl: c.avatarUrl
                    }
                };
            });
        }
    } else if (crisisContractList.length > 0) {
        const latestContract = crisisContractList[0];
        contractLevel = latestContract.highest || 0;
        contractClearTime = latestContract.clearTime || latestContract.costTime || latestContract.time || 0;
        contractChars = latestContract.chars || [];
        contractIndicators = (latestContract.indicators || []).map(ind => {
            const name = ind.name || "";
            const score = ind.score || 1;
            const lookupKey = `${name}_${score}`;
            const tagId = nameScoreToTagId[lookupKey] || nameToTagId[name] || ind.id || "";
            return {
                id: tagId,
                icon: ind.icon || "",
                name: name,
                desc: ind.desc || ""
            };
        });
    }

    const normalized = {
        base: {
            name: base.name || "Operator",
            level: base.level || 1,
            serverId: String(serverId || base.serverId || '3'),
            avatarUrl: base.avatarUrl || ""
        },
        stats: {
            charCount: base.charNum || mappedChars.length || 0,
            explorationLevel: base.worldLevel || 0,
            weaponCount: base.weaponNum || 0,
            fileCount: base.docNum || 0,
            awakeDay: awakeDay,
            sanity: Number(dungeon.curStamina || 0),
            maxSanity: Number(dungeon.maxStamina || 130),
            protoPass: Number(bpSystem.curLevel || 0),
            protoPassMax: Number(bpSystem.maxLevel || 60),
            weeklyRoutine: Number(weeklyMission.score || 0),
            weeklyRoutineMax: Number(weeklyMission.total || 10),
            activityPoints: Number(dailyMission.dailyActivation || 0),
            activityPointsMax: Number(dailyMission.maxDailyActivation || 100)
        },
        contract: {
            level: contractLevel,
            clearTime: contractClearTime,
            chars: contractChars,
            indicators: contractIndicators
        },
        chars: mappedChars,
        detail: detail
    };

    return normalized;
}

module.exports = router;
