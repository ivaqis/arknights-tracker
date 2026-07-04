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

function parseDetailsInUserAccount(userAccount) {
    if (userAccount && userAccount.details) {
        userAccount.details = userAccount.details.map(d => {
            try {
                return {
                    ...d,
                    account_info: typeof d.account_info === 'string' ? JSON.parse(d.account_info) : d.account_info
                };
            } catch (e) {
                return d;
            }
        });
    }
    return userAccount;
}

router.post('/profile', async (req, res) => {
    console.log("[POST /profile] received req.body:", req.body);
    const { idToken, name, picture, is_private, background, game_uid, records_uid, favorite_game_uid } = req.body;
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
            
            const existingUsers = await prisma.userAccount.findMany({
                where: {
                    name: {
                        contains: trimmedName
                    },
                    firebase_uid: {
                        not: firebaseUid
                    }
                }
            });
            const isTaken = existingUsers.some(u => u.name && u.name.toLowerCase() === trimmedName.toLowerCase());
            if (isTaken) {
                return res.status(400).json({ error: "Username is already taken." });
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
        if (favorite_game_uid !== undefined) {
            updateData.favorite_game_uid = favorite_game_uid || null;
        }

        const userAccount = await prisma.userAccount.upsert({
            where: { firebase_uid: firebaseUid },
            update: updateData,
            create: {
                firebase_uid: firebaseUid,
                name: trimmedName || payload.name || "Operator",
                picture: picture || null,
                is_private: is_private !== undefined ? Number(is_private) : 0,
                background: (background && /^[a-zA-Z0-9_]+_potential[135]$/.test(background)) ? background : null,
                favorite_game_uid: favorite_game_uid || null
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

        res.json({ status: 'success', data: parseDetailsInUserAccount(fullUserAccount) });
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

        res.json({ status: 'success', data: parseDetailsInUserAccount(userAccount) });
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
        
        if (!testRecords && (now - lastUpdated < SYNC_COOLDOWN)) {
            const timeRemaining = Math.ceil((SYNC_COOLDOWN - (now - lastUpdated)) / 1000 / 60);
            return res.status(429).json({ 
                error: `Sync is on cooldown. Please wait ${timeRemaining} minutes before trying again.` 
            });
        }

        let syncedAccounts = [];

        if (testRecords) {
            syncedAccounts = testRecords;
        } else {
            if (!gameToken || typeof gameToken !== 'string') {
                return res.status(400).json({ error: "Game token is required." });
            }

            let tokenToUse = gameToken.trim();
            if (tokenToUse.startsWith('{') && tokenToUse.endsWith('}')) {
                try {
                    const parsed = JSON.parse(tokenToUse);
                    if (parsed.data && parsed.data.content) {
                        tokenToUse = parsed.data.content.trim();
                    } else if (parsed.content) {
                        tokenToUse = parsed.content.trim();
                    } else {
                        return res.status(400).json({ error: "Invalid token format in JSON structure." });
                    }
                } catch (err) {
                    return res.status(400).json({ error: "Invalid JSON token format." });
                }
            }

            const base64Regex = /^[A-Za-z0-9+/=_-]+$/;
            if (!base64Regex.test(tokenToUse) || tokenToUse.length < 10 || tokenToUse.length > 128) {
                return res.status(400).json({ error: "Invalid token format." });
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
                leaderboardRouter.clearCache();
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

        res.json({ status: 'success', data: parseDetailsInUserAccount(userAccount) });
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

const ruCharMapping = {
    "эндминистратор": "endministrator1",
    "перлика": "perlica",
    "арделия": "ardelia",
    "пограничник": "pogranichnik",
    "арклайт": "arclight",
    "авивенна": "avywenna",
    "светоснежка": "snowshine",
    "чэнь цяньюй": "chenQianyu",
    "да пан": "daPan",
    "алеш": "alesh",
    "эстелла": "estella",
    "кэтчер": "catcher",
    "флюорит": "fluorite",
    "акэкури": "akekuri",
    "антал": "antal",
    "лейватейн": "laevatain",
    "ивонн": "yvonne",
    "джилберта": "gilberta",
    "эмбер": "ember",
    "ласт райт": "lastRite",
    "лифэн": "lifeng",
    "вулфгард": "wulfgard",
    "ксайхи": "xaihi",
    "ксаихи": "xaihi",
    "тангтанг": "tangtang",
    "росси": "rossi",
    "чжуань фаньи": "zhuangfy",
    "ми фу": "mifu"
};

const apiIdToCharId = {
    "c4cf7541c23c93f991e2e464ee18bb18": "perlica",
    "ad1607a2d5a203b1e95762ff0d911bcd": "chenQianyu",
    "0295282ff895bd1b7242d137da99dc94": "gilberta",
    "bfb4ba13f819568c69c2ae46d8f5b869": "ardelia",
    "ce97268e7469e004a3e7a81e4b09a025": "ember",
    "12ccf3692d76c7bddd3ef84eddd3f3c1": "lastRite",
    "9c4a116d4dba884c3db9b7f46ea7ea20": "pogranichnik",
    "7e6df1575604cc5872590f22af757e40": "alesh",
    "00ff4c582aeeafc237695f81e36969b4": "arclight",
    "e7b91cae9108d01f550922498747a45e": "avywenna",
    "55ab3b3d98fa76a045347d29da1abbca": "daPan",
    "06ba43ff26befc881fd106eaa5ef1b81": "snowshine",
    "26e3cc73ac23deb8f6a875038d2243ff": "wulfgard",
    "3839d35948216cc09368cd62167c7368": "xaihi",
    "a0591d65311b190e7d5e09faa0ed1cdd": "akekuri",
    "1b441436fd73326614cfcd14c640e068": "antal",
    "e6c2a3e9f0b1917eb0b1fe29a4b94b3d": "catcher",
    "50515754ef6085bb6a8ddc21ab18a825": "estella",
    "bcb564ed05eb0912d4b0f86d1e193c9f": "fluorite",
    "ee3bf7197a05580397b45ba2fb1de28e": "tangtang"
};

function getMappedCharId(c) {
    if (!c) return "";
    const rawId = c.charData?.id || c.id || c.charId || "";
    const nameLower = (c.charData?.name || c.name || "").toLowerCase().trim();
    if (rawId === "93e76fbbc07f7b480cfe0870c6414494" || nameLower === "эндминистратор") {
        const avatar = c.charData?.avatarSqUrl || c.avatarSqUrl || c.avatarUrl || "";
        if (avatar.includes("399568dc6c8b6e0331947f58ab7a19ad") || avatar.includes("2f61fccb562d9616a2eb057a349e0be6")) {
            return "endministrator1"; // Female
        }
        return "endministrator2"; // Male
    }
    if (rawId && apiIdToCharId[rawId]) {
        return apiIdToCharId[rawId];
    }
    if (ruCharMapping[nameLower]) {
        return ruCharMapping[nameLower];
    }
    return rawId;
}

function normalizeCultNodeId(id) {
    if (!id) return null;
    const m1 = id.match(/^spaceship_skill_(.+)_(\d+)_(\d+)$/);
    if (m1) {
        return {
            charId: m1[1],
            skillIdx: parseInt(m1[2], 10),
            level: parseInt(m1[3], 10)
        };
    }
    const m2 = id.match(/^fac_(.+)_(\d+)_(\d+)$/);
    if (m2) {
        return {
            charId: m2[1],
            skillIdx: parseInt(m2[2], 10) + 1,
            level: parseInt(m2[3], 10)
        };
    }
    return null;
}

function getCombatTalentLevel(char, idx) {
    const combatNodes = char.charData?.combatTalents || [];
    const latestPassive = char.talent?.latestPassiveSkillNodes || [];
    const talentNodes = combatNodes.filter(node => {
        const match = node.id?.match(/passive_skill_(\d+)_/);
        return match && (parseInt(match[1], 10) + 1) === idx;
    });
    talentNodes.sort((a, b) => a.id.localeCompare(b.id));
    if (talentNodes.length === 0) return 0;
    const activeNode = latestPassive.find(id => talentNodes.some(n => n.id === id));
    if (activeNode) {
        return talentNodes.findIndex(n => n.id === activeNode) + 1;
    }
    return 0;
}

function getBaseSkillLevel(char, idx) {
    const cultNodes = char.charData?.cultivationTalents || [];
    const latestFactory = char.talent?.latestFactorySkillNodes || char.talent?.latestSpaceshipSkillNodes || [];
    const skillNodes = cultNodes.filter(node => {
        const parts = node.id.split('_');
        if (parts.length >= 2) {
            const parsedIdx = parseInt(parts[parts.length - 2], 10);
            return parsedIdx === idx;
        }
        return false;
    });
    skillNodes.sort((a, b) => a.id.localeCompare(b.id));
    if (skillNodes.length === 0) return 0;
    const activeNode = latestFactory.find(activeId => {
        const normActive = normalizeCultNodeId(activeId);
        return skillNodes.some(n => {
            const normN = normalizeCultNodeId(n.id);
            return normActive && normN &&
                normActive.charId === normN.charId &&
                normActive.skillIdx === normN.skillIdx &&
                normActive.level === normN.level;
        });
    });
    if (activeNode) {
        const norm = normalizeCultNodeId(activeNode);
        return norm ? norm.level : 0;
    }
    return 0;
}

function getStaticWeaponId(weapon) {
    if (!weapon || !weapon.weaponData) return null;
    const skills = weapon.weaponData.skills || [];
    for (const s of skills) {
        if (s.key && s.key.startsWith('sk_wpn_')) {
            return s.key.substring(3);
        }
    }
    return weapon.weaponData.id || weapon.id;
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
        const mappedId = getMappedCharId(c);
        const charObj = {
            id: mappedId,
            name: c.charData?.name || c.name || "Operator",
            level: c.level || 1,
            evolvePhase: c.evolvePhase || 0,
            potentialLevel: c.potentialLevel || 0,
            potential: (c.potentialLevel !== undefined ? c.potentialLevel + 1 : (c.potential || 1)),
            charData: c.charData,
            userSkills: c.userSkills || {},
            weapon: c.weapon || null,
            bodyEquip: c.bodyEquip || null,
            armEquip: c.armEquip || null,
            firstAccessory: c.firstAccessory || null,
            secondAccessory: c.secondAccessory || null,
            talent: c.talent || {}
        };
        
        const talentLevels = {
            talent1: getCombatTalentLevel(charObj, 1),
            talent2: getCombatTalentLevel(charObj, 2),
            baseSkill1: getBaseSkillLevel(charObj, 1),
            baseSkill2: getBaseSkillLevel(charObj, 2)
        };

        const prunedCharData = {
            rarity: Number(c.charData?.rarity?.value || c.rarity || 4),
            property: c.charData?.property ? { key: c.charData.property.key } : null,
            skills: (c.charData?.skills || []).map(s => ({
                id: s.id,
                key: s.key,
                name: s.name,
                property: s.property ? { key: s.property.key } : null
            })),
            combatTalents: (c.charData?.combatTalents || []).map(t => ({
                id: t.id,
                name: t.name,
                descParams: t.descParams
            })),
            cultivationTalents: (c.charData?.cultivationTalents || []).map(t => ({
                id: t.id,
                name: t.name,
                descParams: t.descParams
            })),
            abilityTalents: (c.charData?.abilityTalents || []).map(t => ({
                id: t.id,
                name: t.name,
                desc: t.desc || "",
                descParams: t.descParams
            }))
        };

        const prunedUserSkills = {};
        if (c.userSkills) {
            for (const [skId, skVal] of Object.entries(c.userSkills)) {
                if (skVal) {
                    prunedUserSkills[skId] = { level: skVal.level || 1 };
                }
            }
        }

        const weaponStaticId = getStaticWeaponId(c.weapon);
        const rawRarity = c.weapon ? (c.weapon.rarity || c.weapon.weaponData?.rarity) : null;
        const prunedWeapon = c.weapon ? {
            id: weaponStaticId || c.weapon.id,
            level: c.weapon.level,
            refineLevel: c.weapon.refineLevel,
            rarity: rawRarity && typeof rawRarity === 'object' ? Number(rawRarity.value) : rawRarity,
            weaponTerms: c.weapon.weaponTerms,
            weaponData: c.weapon.weaponData ? {
                id: weaponStaticId || c.weapon.weaponData.id,
                name: c.weapon.weaponData.name,
                rarity: c.weapon.weaponData.rarity ? { value: c.weapon.weaponData.rarity.value } : null,
                skills: (c.weapon.weaponData.skills || []).map(s => ({ key: s.key }))
            } : null,
            gem: c.weapon.gem ? {
                gemData: c.weapon.gem.gemData ? {
                    id: c.weapon.gem.gemData.id,
                    icon: c.weapon.gem.gemData.icon,
                    templateId: c.weapon.gem.gemData.templateId,
                    termId: c.weapon.gem.gemData.termId,
                    name: c.weapon.gem.gemData.name,
                    rarity: c.weapon.gem.gemData.rarity
                } : null
            } : null
        } : null;

        const pruneEquip = (eq) => {
            if (!eq) return null;
            return {
                id: eq.id,
                enhanceStatus: eq.enhanceStatus,
                equipData: eq.equipData ? {
                    id: eq.equipData.id,
                    name: eq.equipData.name,
                    level: eq.equipData.level,
                    properties: eq.equipData.properties
                } : null
            };
        };

        return {
            id: charObj.id,
            level: charObj.level,
            evolvePhase: charObj.evolvePhase,
            potentialLevel: charObj.potentialLevel,
            potential: charObj.potential,
            charData: prunedCharData,
            userSkills: prunedUserSkills,
            weapon: prunedWeapon,
            bodyEquip: pruneEquip(c.bodyEquip),
            armEquip: pruneEquip(c.armEquip),
            firstAccessory: pruneEquip(c.firstAccessory),
            secondAccessory: pruneEquip(c.secondAccessory),
            talent: c.talent ? { attrNodes: c.talent.attrNodes || [] } : {},
            talentLevels
        };
    });

    let contractLevel = 0;
    let contractClearTime = 0;
    let contractChars = [];
    let contractIndicators = [];

    const mapContractChar = (c) => {
        const mappedId = getMappedCharId(c);
        const rosterChar = mappedChars.find(rc => rc.id === mappedId);

        const contractRawRarity = c.weapon ? (c.weapon.rarity || c.weapon.weaponData?.rarity) : null;
        const rawWeapon = rosterChar ? rosterChar.weapon : (c.weapon ? {
            id: getStaticWeaponId(c.weapon) || c.weapon.id,
            level: c.weapon.level,
            refineLevel: c.weapon.refineLevel,
            rarity: contractRawRarity && typeof contractRawRarity === 'object' ? Number(contractRawRarity.value) : contractRawRarity,
            weaponTerms: c.weapon.weaponTerms || []
        } : null);

        const weapon = rawWeapon ? {
            id: rawWeapon.id,
            level: rawWeapon.level,
            refineLevel: rawWeapon.refineLevel,
            rarity: rawWeapon.rarity,
            weaponTerms: (c.weapon && c.weapon.weaponTerms && c.weapon.weaponTerms.length > 0) ? c.weapon.weaponTerms : (rawWeapon.weaponTerms || [])
        } : null;

        const pruneContractEquip = (eq) => {
            if (!eq) return null;
            return {
                id: eq.id,
                enhanceStatus: eq.enhanceStatus,
                equipData: eq.equipData ? {
                    id: eq.equipData.id,
                    name: eq.equipData.name,
                    level: eq.equipData.level,
                    properties: eq.equipData.properties
                } : null
            };
        };

        const equips = rosterChar ? {
            bodyEquip: rosterChar.bodyEquip,
            armEquip: rosterChar.armEquip,
            firstAccessory: rosterChar.firstAccessory,
            secondAccessory: rosterChar.secondAccessory
        } : (c.equips ? {
            bodyEquip: pruneContractEquip(c.equips.bodyEquip),
            armEquip: pruneContractEquip(c.equips.armEquip),
            firstAccessory: pruneContractEquip(c.equips.firstAccessory),
            secondAccessory: pruneContractEquip(c.equips.secondAccessory)
        } : null);

        return {
            id: mappedId,
            level: c.level || 1,
            potentialLevel: c.potentialLevel || 0,
            potential: c.potentialLevel + 1,
            weapon: weapon,
            equips: equips,
            charData: rosterChar ? {
                avatarSqUrl: rosterChar.charData?.avatarSqUrl || ""
            } : {
                avatarSqUrl: c.avatarUrl || c.charData?.avatarSqUrl || ""
            }
        };
    };

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
                return nameScoreToTagId[lookupKey] || nameToTagId[name] || ind.id || "";
            });
            const detailCharsList = contractDetail.bestRecordDetail?.chars || bestRecord.chars || [];
            contractChars = detailCharsList.map(mapContractChar);
        }
    } else if (crisisContractList.length > 0) {
        const latestContract = crisisContractList[0];
        contractLevel = latestContract.highest || 0;
        contractClearTime = latestContract.clearTime || latestContract.costTime || latestContract.time || 0;
        contractChars = (latestContract.chars || []).map(mapContractChar);
        contractIndicators = (latestContract.indicators || []).map(ind => {
            const name = ind.name || "";
            const score = ind.score || 1;
            const lookupKey = `${name}_${score}`;
            return nameScoreToTagId[lookupKey] || nameToTagId[name] || ind.id || "";
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
        chars: mappedChars
    };

    return normalized;
}

module.exports = router;
