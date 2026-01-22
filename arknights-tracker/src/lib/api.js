// src/lib/api.js

// Point this to your backend
const BACKEND_URL = "/api";
export const API_BASE = "";

/**
 * Proxy fetch to bypass CORS and get gacha logs
 */
export async function proxyImport(urlInput, saveStats = true) {
    const res = await fetch(`${BACKEND_URL}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawUrl: urlInput, saveStats })
    });
    
    if (!res.ok) throw new Error("Backend connection failed");
    return await res.json();
}

/**
 * Fetch percentiles for the rating card
 */
export async function fetchGlobalStats(uid, poolType) {
    try {
        const res = await fetch(`${BACKEND_URL}/stats/${uid}?pool=${poolType}`);
        if (res.ok) return await res.json();
    } catch (e) {
        console.error("Stats fetch failed", e);
    }
    return null;
}