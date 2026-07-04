// src/lib/api.js

const runtimeBase =
    typeof window !== 'undefined' && window.__CONFIG__ && window.__CONFIG__.API_BASE
        ? window.__CONFIG__.API_BASE
        : undefined;

export const API_BASE =
    runtimeBase ??
    import.meta.env.VITE_API_BASE ??
    (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

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

export async function getUserProfile(uid) {
    try {
        const res = await fetch(`${API_BASE}/user/profile/${uid}`);
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
    } catch (e) {
        console.error("getUserProfile Error:", e);
        return null;
    }
}

export async function registerProfile(idToken, name, picture = null, is_private = undefined, background = undefined, records_uid = undefined, game_uid = undefined, favorite_game_uid = undefined) {
    const bodyObj = { idToken };
    if (name !== undefined) bodyObj.name = name;
    if (picture !== undefined) bodyObj.picture = picture;
    if (is_private !== undefined) bodyObj.is_private = is_private;
    if (background !== undefined) bodyObj.background = background;
    if (records_uid !== undefined) bodyObj.records_uid = records_uid;
    if (game_uid !== undefined) bodyObj.game_uid = game_uid;
    if (favorite_game_uid !== undefined) bodyObj.favorite_game_uid = favorite_game_uid;

    const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to save profile');
    return json.data;
}

export async function syncGameAccount(idToken, gameToken, testRecords = null, serverId = null) {
    const res = await fetch(`${API_BASE}/user/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, gameToken, testRecords, serverId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to sync game account');
    return json.game_accounts;
}

export async function uploadAvatar(idToken, base64Image, filename = '') {
    const res = await fetch(`${API_BASE}/user/upload-avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, image: base64Image, filename })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to upload avatar');
    return json; // Returns { status, nsfw, picture, data, message }
}

export async function fetchLeaderboard(eventType) {
    try {
        const res = await fetch(`${API_BASE}/leaderboard?event_type=${eventType}`);
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        const json = await res.json();
        return json.data;
    } catch (e) {
        console.error("fetchLeaderboard Error:", e);
        return [];
    }
}

export async function fetchLeaderboardRun(id) {
    try {
        const res = await fetch(`${API_BASE}/leaderboard/run/${id}`);
        if (!res.ok) throw new Error('Failed to fetch leaderboard run details');
        const json = await res.json();
        return json.data;
    } catch (e) {
        console.error("fetchLeaderboardRun Error:", e);
        return null;
    }
}

export async function deleteGameAccount(idToken, gameUid) {
    const res = await fetch(`${API_BASE}/user/game-account/${gameUid}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete game account');
    return json;
}

export async function getUserProfileByName(name) {
    try {
        const res = await fetch(`${API_BASE}/user/profile-by-name/${encodeURIComponent(name)}`);
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
    } catch (e) {
        console.error("getUserProfileByName Error:", e);
        return null;
    }
}

