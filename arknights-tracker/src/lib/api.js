import { equipment } from "$lib/data/items/equipment.js";
import { characters } from "$lib/data/characters.js";

const runtimeBase =
    typeof window !== 'undefined' && window.__CONFIG__ && window.__CONFIG__.API_BASE
        ? window.__CONFIG__.API_BASE
        : undefined;

export const API_BASE =
    runtimeBase ??
    import.meta.env.VITE_API_BASE ??
    (import.meta.env.PROD ? '/api/v2' : 'http://localhost:3001/api/v2');

const runtimeAudioBase =
    typeof window !== 'undefined' && window.__CONFIG__ && window.__CONFIG__.AUDIO_BASE
        ? window.__CONFIG__.AUDIO_BASE
        : undefined;

export const AUDIO_BASE =
    runtimeAudioBase ??
    import.meta.env.VITE_AUDIO_BASE ??
    '/audio';

export function getAvatarUrl(pictureId) {
    if (!pictureId) return "";
    if (pictureId.startsWith("http://") || pictureId.startsWith("https://")) return pictureId;
    const base = API_BASE.replace(/\/api\/v2\/?$/, "");
    return `${base}/uploads/${pictureId}.webp`;
}

export async function fetchGlobalStats(uid, poolId) {
    try {
        const url = `${API_BASE}/rankings/data?bannerId=${poolId}&uid=${uid}`;
        const res = await fetch(url);
        if (!res.ok) {
            const errText = await res.text();
            console.error(`SERVER ERROR (${res.status}):`, errText);
            throw new Error(`Server responded with ${res.status}: ${errText}`);
        }
        const json = await res.json();
        return json.data;
    } catch (e) {
        console.error("Fetch stats CRITICAL FAIL:", e);
        return null;
    }
}

export async function fetchRankingRate(params) {
    try {
        const searchParams = new URLSearchParams();
        searchParams.set('bannerType', params.bannerType);
        searchParams.set('totalPulls', String(params.totalPulls));
        searchParams.set('total5Pulls', String(params.total5Pulls));
        searchParams.set('total6Pulls', String(params.total6Pulls));
        if (params.total5050 !== undefined && params.total5050 !== null) {
            searchParams.set('total5050', String(params.total5050));
        }
        if (params.won5050 !== undefined && params.won5050 !== null) {
            searchParams.set('won5050', String(params.won5050));
        }
        searchParams.set('countMe', params.countMe !== undefined ? String(params.countMe) : 'true');

        const res = await fetch(`${API_BASE}/rankings/rate?${searchParams.toString()}`);
        if (!res.ok) return null;
        const json = await res.json();
        return json.data?.stats ?? null;
    } catch (e) {
        console.error('fetchRankingRate Error:', e);
        return null;
    }
}

function normalizeCharId(id) {
    if (!id) return "";
    const char = characters[id] || Object.values(characters).find(c => c.gameId === id || c.apiId === id || c.id === id);
    return char ? char.id : id;
}

function normalizeWeapon(wpn) {
    if (!wpn) return null;
    let gem = wpn.gem;
    if (gem && !gem.gemData) {
        gem = {
            ...gem,
            gemData: {
                termId: gem.termId || "",
                name: gem.name || "",
                templateId: gem.templateId || "item_gem_rarity_4",
                icon: gem.iconUrl || gem.icon || ""
            }
        };
    }
    return {
        ...wpn,
        gem
    };
}

function normalizeEquip(eq) {
    if (!eq) return null;
    const rawId = eq.id || eq.equipId || eq.equipData?.id || "";
    const fullId = rawId.startsWith("item_") ? rawId : `item_${rawId}`;
    const staticEq = equipment[fullId] || equipment[rawId] || {};
    let enhanceStatus = eq.enhanceStatus;
    if (enhanceStatus === undefined || enhanceStatus === null) {
        if (eq.enhance && typeof eq.enhance === "object" && Object.keys(eq.enhance).length > 0) {
            enhanceStatus = Object.keys(eq.enhance).length + 1;
        } else {
            enhanceStatus = 1;
        }
    }
    const parsedLevel = (eq.level && Number(eq.level) > 0)
        ? Number(eq.level)
        : (eq.equipData?.level?.value ? parseInt(eq.equipData.level.value, 10) : (staticEq.level || 1));
    const mergedEquipData = {
        id: fullId,
        name: eq.equipData?.name || eq.name || staticEq.name || fullId,
        level: parsedLevel,
        rarity: staticEq.rarity || 4,
        properties: (staticEq.displayAttr || []).map(a => `equip_attr_${a.attrType?.toLowerCase() || ""}`),
        ...staticEq,
        ...(eq.equipData || {})
    };
    return {
        ...eq,
        id: fullId,
        level: parsedLevel,
        enhanceStatus: Number(enhanceStatus),
        equipData: mergedEquipData
    };
}

function normalizeGameProfiles(data) {
    if (Array.isArray(data.gameProfiles)) {
        return data.gameProfiles.map(gp => {
            const base = gp.gameProfile?.base || {};
            const dungeon = gp.gameProfile?.dungeon || {};
            const bpSystem = gp.gameProfile?.bpSystem || {};
            const daily = gp.gameProfile?.dailyMission || {};
            const weekly = gp.gameProfile?.weeklyMission || {};
            const roleId = base.roleId || "";
            const serverId = base.serverId || "3";
            const stats = {
                charCount: base.charNum || 0,
                explorationLevel: base.worldLevel || 0,
                weaponCount: base.weaponNum || 0,
                fileCount: base.docNum || 0,
                sanity: parseInt(dungeon.curStamina, 10) || 0,
                maxSanity: parseInt(dungeon.maxStamina, 10) || 358,
                protoPass: bpSystem.curLevel || 0,
                protoPassMax: bpSystem.maxLevel || 60,
                weeklyRoutine: weekly.score || 0,
                weeklyRoutineMax: weekly.total || 10,
                activityPoints: daily.dailyActivation || 0,
                activityPointsMax: daily.maxDailyActivation || 100
            };
            const contract = gp.contract ? {
                ...gp.contract,
                level: gp.contract.indicatorCount || 0,
                contractLevel: gp.contract.indicatorCount || 0,
                clearTime: gp.contract.passTs || 0,
                clear_time: gp.contract.passTs || 0,
                indicators: gp.contract.indicators || [],
                chars: (gp.contract.chars || []).map(c => {
                    const normId = normalizeCharId(c.id);
                    const equipsObj = c.equips || {};
                    const bodyEquip = normalizeEquip(c.bodyEquip || equipsObj.bodyEquip);
                    const armEquip = normalizeEquip(c.armEquip || equipsObj.armEquip);
                    const firstAccessory = normalizeEquip(c.firstAccessory || equipsObj.firstAccessory);
                    const secondAccessory = normalizeEquip(c.secondAccessory || equipsObj.secondAccessory);
                    const lvl = Number(c.level) || 1;
                    let evolvePhase = c.evolvePhase;
                    if (evolvePhase === undefined || evolvePhase === null) {
                        if (lvl > 80) evolvePhase = 4;
                        else if (lvl > 60) evolvePhase = 3;
                        else if (lvl > 40) evolvePhase = 2;
                        else if (lvl > 20) evolvePhase = 1;
                        else evolvePhase = 0;
                    }
                    return {
                        ...c,
                        id: normId,
                        gameId: c.id,
                        potential: c.potentialLevel || c.potential || 1,
                        evolvePhase: Number(evolvePhase),
                        weapon: normalizeWeapon(c.weapon),
                        bodyEquip,
                        armEquip,
                        firstAccessory,
                        secondAccessory,
                        equips: [bodyEquip, armEquip, firstAccessory, secondAccessory].filter(Boolean)
                    };
                })
            } : null;
            const chars = (gp.gameProfile?.chars || []).map(c => {
                const userSkills = {};
                (c.skills || []).forEach(s => {
                    if (s.type) userSkills[s.type] = { level: s.level, maxLevel: s.maxLevel };
                    if (s.id) userSkills[s.id] = { level: s.level, maxLevel: s.maxLevel };
                });
                const normId = normalizeCharId(c.id);
                const lvl = Number(c.level) || 1;
                const breakNode = c.talent?.latestBreakNode || "";
                let evolvePhase = c.evolvePhase;
                if (evolvePhase === undefined || evolvePhase === null) {
                    if (breakNode.includes("70") || breakNode.includes("T5")) evolvePhase = 4;
                    else if (breakNode.includes("60") || breakNode.includes("T4")) evolvePhase = 3;
                    else if (breakNode.includes("40") || breakNode.includes("T3")) evolvePhase = 2;
                    else if (breakNode.includes("20") || breakNode.includes("T2")) evolvePhase = 1;
                    else if (lvl > 80) evolvePhase = 4;
                    else if (lvl > 60) evolvePhase = 3;
                    else if (lvl > 40) evolvePhase = 2;
                    else if (lvl > 20) evolvePhase = 1;
                    else evolvePhase = 0;
                }
                return {
                    ...c,
                    id: normId,
                    gameId: c.id,
                    potential: c.potentialLevel || 1,
                    evolvePhase: Number(evolvePhase),
                    userSkills,
                    weapon: normalizeWeapon(c.weapon),
                    bodyEquip: normalizeEquip(c.bodyEquip),
                    armEquip: normalizeEquip(c.armEquip),
                    firstAccessory: normalizeEquip(c.firstAccessory),
                    secondAccessory: normalizeEquip(c.secondAccessory),
                    equips: [c.bodyEquip, c.armEquip, c.firstAccessory, c.secondAccessory].map(normalizeEquip).filter(Boolean)
                };
            });
            return {
                game_uid: roleId,
                records_uid: gp.pulls ? (gp.pulls.profileId || roleId) : null,
                serverId: serverId,
                pulls: gp.pulls,
                info: {
                    base,
                    chars,
                    contract,
                    stats
                }
            };
        });
    }
    if (Array.isArray(data.details)) {
        return data.details.map(d => {
            try {
                return {
                    ...d,
                    info: typeof d.account_info === 'string' ? JSON.parse(d.account_info) : (d.info || d.account_info || {})
                };
            } catch {
                return { ...d, info: d.info || {} };
            }
        });
    }
    return [];
}

export function normalizeProfile(data) {
    if (!data) return null;
    const name = data.publicUid ?? data.name ?? "";
    const picture = data.avatarId ?? data.picture ?? null;
    const background = data.backgroundId ?? data.background ?? null;
    const is_private = data.isPrivate !== undefined ? (data.isPrivate ? 1 : 0) : (data.is_private ?? 0);
    const details = normalizeGameProfiles(data);
    return {
        ...data,
        name,
        publicUid: name,
        picture,
        avatarId: picture,
        background,
        backgroundId: background,
        is_private,
        isPrivate: is_private === 1,
        details
    };
}

async function getPublicUidFromToken(token) {
    try {
        const res = await fetch(`${API_BASE}/user/list`, {
            headers: { Authorization: `Firebase ${token}` }
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data?.list?.[0] || null;
    } catch {
        return null;
    }
}

export async function getUserProfile(uid, token = null) {
    try {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Firebase ${token}`;
        }
        let targetUid = uid;
        if (!targetUid && token) {
            targetUid = await getPublicUidFromToken(token);
            if (!targetUid) return null;
        }
        let res = await fetch(`${API_BASE}/user/profile/get?uid=${encodeURIComponent(targetUid)}`, { headers });
        if (res.status === 404 && token && targetUid === uid) {
            const listUid = await getPublicUidFromToken(token);
            if (listUid && listUid !== targetUid) {
                targetUid = listUid;
                res = await fetch(`${API_BASE}/user/profile/get?uid=${encodeURIComponent(targetUid)}`, { headers });
            }
        }
        if (!res.ok) return null;
        const json = await res.json();
        return normalizeProfile(json.data);
    } catch (e) {
        console.error("getUserProfile Error:", e);
        return null;
    }
}

export async function getUserProfileByName(name, token = null) {
    return getUserProfile(name, token);
}

export async function createUserProfile(idToken, name, isPrivate = false, avatarImage = null, filename = null, backgroundId = null) {
    const res = await fetch(`${API_BASE}/user/profile/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Firebase ${idToken}`
        },
        body: JSON.stringify({
            publicUid: name,
            isPrivate: !!isPrivate,
            avatarImage,
            filename,
            backgroundId
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Failed to create profile');
    return normalizeProfile(json.data);
}

export async function updateUserProfile(idToken, currentUid, updates = {}) {
    let uid = currentUid;
    if (!uid) {
        uid = await getPublicUidFromToken(idToken);
    }
    const body = {};
    if (updates.newUid !== undefined) body.newUid = updates.newUid;
    if (updates.isPrivate !== undefined) body.isPrivate = !!updates.isPrivate;
    if (updates.backgroundId !== undefined) body.backgroundId = updates.backgroundId;

    const res = await fetch(`${API_BASE}/user/profile/update?uid=${encodeURIComponent(uid)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Firebase ${idToken}`
        },
        body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Failed to update profile');
    return normalizeProfile(json.data);
}

export async function registerProfile(idToken, name, picture = null, is_private = undefined, background = undefined, records_uid = undefined, game_uid = undefined, favorite_game_uid = undefined, currentUid = undefined) {
    const targetUid = currentUid || name;
    if (currentUid || (is_private !== undefined || background !== undefined)) {
        try {
            return await updateUserProfile(idToken, targetUid, {
                newUid: name !== targetUid ? name : undefined,
                isPrivate: is_private !== undefined ? (is_private === 1 || is_private === true) : undefined,
                backgroundId: background !== undefined ? background : undefined
            });
        } catch (e) {
            if (e.message && e.message.includes("User not found")) {
                return await createUserProfile(idToken, name, is_private === 1 || is_private === true, null, null, background || null);
            }
            throw e;
        }
    }
    return await createUserProfile(idToken, name, is_private === 1 || is_private === true, null, null, background || null);
}

export async function syncGameAccount(idToken, gameToken, testRecords = null, serverId = null, currentUid = null) {
    let uid = currentUid;
    if (!uid) {
        uid = await getPublicUidFromToken(idToken);
    }
    const serverIds = serverId === "both" ? ["2", "3"] : [String(serverId || "3")];
    const res = await fetch(`${API_BASE}/user/sync?uid=${encodeURIComponent(uid)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Firebase ${idToken}`
        },
        body: JSON.stringify({ token: gameToken, serverIds })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Failed to sync game account');
    return json.data;
}

export async function uploadAvatar(idToken, base64Image, filename = 'avatar.webp', currentUid = null) {
    let uid = currentUid;
    if (!uid) {
        uid = await getPublicUidFromToken(idToken);
    }
    const res = await fetch(`${API_BASE}/user/avatar/upload?uid=${encodeURIComponent(uid)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Firebase ${idToken}`
        },
        body: JSON.stringify({ image: base64Image, filename })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Failed to upload avatar');
    return {
        status: res.status,
        nsfw: json.data?.nsfw || false,
        picture: json.data?.avatarId || null,
        avatarId: json.data?.avatarId || null,
        code: json.data?.code ?? 0,
        message: json.message
    };
}

export async function deleteAvatar(idToken, currentUid = null) {
    let uid = currentUid;
    if (!uid) {
        uid = await getPublicUidFromToken(idToken);
    }
    const res = await fetch(`${API_BASE}/user/avatar/delete?uid=${encodeURIComponent(uid)}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Firebase ${idToken}`
        }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Failed to delete avatar');
    return json.data;
}

export async function deleteGameAccount(idToken, gameUid, currentUid = null) {
    let uid = currentUid;
    if (!uid) {
        uid = await getPublicUidFromToken(idToken);
    }
    const res = await fetch(`${API_BASE}/user/game-account/delete?uid=${encodeURIComponent(uid)}&gameUid=${encodeURIComponent(gameUid)}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Firebase ${idToken}`
        }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Failed to delete game account');
    return json.data;
}

export async function linkUserPulls(idToken, gameUid, privateId) {
    const res = await fetch(`${API_BASE}/user/pulls/link?gameUid=${encodeURIComponent(gameUid)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Firebase ${idToken}`
        },
        body: JSON.stringify({ privateId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Failed to link user pulls');
    return json.data;
}

export async function unlinkUserPulls(idToken, gameUid) {
    const res = await fetch(`${API_BASE}/user/pulls/unlink?gameUid=${encodeURIComponent(gameUid)}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Firebase ${idToken}`
        }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Failed to unlink user pulls');
    return json.data;
}

export async function fetchLeaderboard(params = 'contract') {
    try {
        const options = typeof params === 'string' ? { event: params } : (params || {});
        const eventType = options.event || (options.dungeonId ? 'monument' : 'contract');

        if (eventType === 'monument') {
            const dungeonId = options.dungeonId || 'indie_hard001';
            let sortField = options.sortField === 'level' ? 'level' : 'time';
            let sortOrder = options.sortOrder || (sortField === 'time' ? 'asc' : 'desc');
            const serverId = options.serverId || 'all';
            const page = String(options.page || '1');
            const recordsOnPage = String(options.recordsOnPage || '100');
            const charsFilter = options.charsFilter || '';
            const charCountFilter = options.charCountFilter || '';

            const query = new URLSearchParams({
                dungeonId,
                sortField,
                sortOrder,
                serverId,
                page,
                recordsOnPage,
                charsFilter,
                charCountFilter
            });

            const res = await fetch(`${API_BASE}/leaderboard/monument/list?${query.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch monument leaderboard');
            const json = await res.json();
            const list = json.data?.list || [];

            return list.map(r => ({
                id: r.recordId,
                recordId: r.recordId,
                user: {
                    name: r.uid,
                    picture: r.avatarId,
                    avatar_strike: 0
                },
                level: r.level,
                contractLevel: 0,
                clear_time: r.passTs,
                updatedAt: r.ts,
                serverId: r.serverId,
                chars: (r.chars || []).map(c => ({
                    id: normalizeCharId(c.id),
                    gameId: c.id,
                    level: c.level,
                    potential: c.potentialLevel,
                    weapon: normalizeWeapon(c.weapon)
                }))
            }));
        }

        let contractId = options.contractId || "indie_contract001";
        let sortField = "indicatorCount";
        let sortOrder = "desc";
        let serverId = options.serverId || "all";
        let page = String(options.page || "1");
        let recordsOnPage = String(options.recordsOnPage || "100");

        if (options.sortField && options.sortField !== 'default') {
            sortField = options.sortField === 'contractLevel' ? 'indicatorCount' : options.sortField;
        }
        if (options.sortOrder) {
            sortOrder = options.sortOrder;
        } else if (sortField === 'time') {
            sortOrder = 'asc';
        }

        const query = new URLSearchParams({
            contractId,
            sortField,
            sortOrder,
            serverId,
            page,
            recordsOnPage
        });

        const res = await fetch(`${API_BASE}/leaderboard/contract/list?${query.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch contract leaderboard');
        const json = await res.json();
        const list = json.data?.list || [];

        return list.map(r => ({
            id: r.recordId,
            recordId: r.recordId,
            user: {
                name: r.uid,
                picture: r.avatarId,
                avatar_strike: 0
            },
            level: r.level,
            contractLevel: r.indicatorCount,
            clear_time: r.passTs,
            updatedAt: r.ts,
            serverId: r.serverId,
            chars: (r.chars || []).map(c => ({
                id: normalizeCharId(c.id),
                gameId: c.id,
                level: c.level,
                potential: c.potentialLevel,
                weapon: normalizeWeapon(c.weapon)
            }))
        }));
    } catch (e) {
        console.error("fetchLeaderboard Error:", e);
        return [];
    }
}

export async function fetchLeaderboardRun(id, eventType = 'contract') {
    try {
        const endpoint = eventType === 'monument'
            ? `${API_BASE}/leaderboard/monument/run?recordId=${encodeURIComponent(id)}`
            : `${API_BASE}/leaderboard/contract/run?recordId=${encodeURIComponent(id)}`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Failed to fetch leaderboard run details');
        const json = await res.json();
        const run = json.data;
        if (!run) return null;
        const rd = run.recordData || {};
        return {
            ...rd,
            uid: run.uid,
            avatarId: run.avatarId,
            level: rd.indicatorCount ?? run.level,
            contractLevel: rd.indicatorCount ?? 0,
            clearTime: rd.passTs ?? 0,
            clear_time: rd.passTs ?? 0,
            indicators: rd.indicators || [],
            chars: (rd.chars || []).map(c => {
                const normId = normalizeCharId(c.id);
                const equipsObj = c.equips || {};
                const bodyEquip = normalizeEquip(c.bodyEquip || equipsObj.bodyEquip);
                const armEquip = normalizeEquip(c.armEquip || equipsObj.armEquip);
                const firstAccessory = normalizeEquip(c.firstAccessory || equipsObj.firstAccessory);
                const secondAccessory = normalizeEquip(c.secondAccessory || equipsObj.secondAccessory);
                return {
                    ...c,
                    id: normId,
                    gameId: c.id,
                    potential: c.potentialLevel ?? c.potential ?? 1,
                    weapon: normalizeWeapon(c.weapon),
                    bodyEquip,
                    armEquip,
                    firstAccessory,
                    secondAccessory,
                    equips: [bodyEquip, armEquip, firstAccessory, secondAccessory].filter(Boolean)
                };
            })
        };
    } catch (e) {
        console.error("fetchLeaderboardRun Error:", e);
        return null;
    }
}

