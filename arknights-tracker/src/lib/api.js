// src/lib/api.js

export const API_BASE = import.meta.env.PROD 
    ? '/api'
    : 'http://localhost:3001/api';

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