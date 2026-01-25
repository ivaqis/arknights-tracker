// src/lib/api.js

// Point this to your backend
const BACKEND_URL = "/api";
export const API_BASE = import.meta.env.PROD 
    ? '/api'
    : 'http://localhost:3001/api';

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
export async function fetchGlobalStats(uid, poolId) {
    try {
        // [FIX] Изменили stats на rankings/data чтобы обойти AdBlock
        const res = await fetch(`${API_BASE}/rankings/data?bannerId=${poolId}&uid=${uid}`);
        
        if (!res.ok) throw new Error("API Error");
        
        const json = await res.json();
        if (json.code !== 0) return null;

        return json.data; // Тут нужно будет переделать логику рангов, если бэк не возвращает их
    } catch (e) {
        console.error("Fetch stats failed:", e);
        return null;
    }
}