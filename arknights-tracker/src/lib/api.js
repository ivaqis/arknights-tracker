// src/lib/api.js

const BACKEND_URL = "/api";
export const API_BASE = import.meta.env.PROD 
    ? '/api'
    : 'http://localhost:3001/api';

export async function proxyImport(urlInput, saveStats = true) {
    const res = await fetch(`${BACKEND_URL}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawUrl: urlInput, saveStats })
    });
    
    if (!res.ok) throw new Error("Backend connection failed");
    return await res.json();
}

export async function fetchGlobalStats(uid, poolId) {
    try {
        const url = `${API_BASE}/rankings/data?bannerId=${poolId}&uid=${uid}`;
        console.log("Fetching stats from:", url); // Лог для проверки URL

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