import { writable, get } from "svelte/store";
import { auth, db, provider, analytics } from "$lib/firebase"; 
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { accountStore } from "$lib/stores/accounts"; 

export const user = writable(null);
export const syncStatus = writable("idle"); 
export const cloudDataBuffer = writable(null);

function countAllLocalPulls() {
    if (typeof window === 'undefined') return 0;
    let accounts = [];
    try { const raw = localStorage.getItem("ark_tracker_accounts"); if (raw) accounts = JSON.parse(raw).accounts; } catch(e) {}
    if (!accounts || !accounts.length) accounts = [{id: 'main'}];
    let total = 0;
    accounts.forEach(acc => {
        const raw = localStorage.getItem(`ark_tracker_data_${acc.id}`);
        if (raw) {
            try {
                const data = JSON.parse(raw);
                ['standard', 'special', 'new-player'].forEach(cat => { if (data[cat]?.pulls) total += data[cat].pulls.length; });
            } catch (e) {}
        }
    });
    return total;
}

export function initAuth() {
    onAuthStateChanged(auth, (u) => {
        user.set(u);
        if (u) checkSync(u);
    });
}

export async function login() {
    try { await signInWithPopup(auth, provider); } catch (e) { console.error(e); }
}

export async function logout() {
    await signOut(auth);
    user.set(null);
    syncStatus.set("idle");
    cloudDataBuffer.set(null);
    if (typeof window !== 'undefined') localStorage.removeItem("ark_last_sync");
}

export async function checkSync(currentUser, freshSnapshot = null) {
    if (!currentUser) return;
    syncStatus.set("checking");

    try {
        const localLastUpdated = parseInt(localStorage.getItem("ark_last_sync") || "0");
        
        let localTotal = 0;
        let accounts = [];
        let selectedId = 'main';
        try {
            if (accountStore.accounts) accounts = get(accountStore.accounts);
            if (accountStore.selectedId) selectedId = get(accountStore.selectedId);
        } catch (e) {}
        
        if (!accounts || !accounts.length) {
             try { const raw = localStorage.getItem("ark_tracker_accounts"); if (raw) { const p = JSON.parse(raw); accounts = p.accounts; selectedId = p.selectedId; } } catch(e) {}
        }
        if (!accounts || !accounts.length) accounts = [{id: 'main'}];

        accounts.forEach(acc => {
            if (acc.id === selectedId && freshSnapshot) {
                ['standard', 'special', 'new-player'].forEach(cat => {
                    if (freshSnapshot[cat]?.pulls) localTotal += freshSnapshot[cat].pulls.length;
                });
            } else {
                const raw = localStorage.getItem(`ark_tracker_data_${acc.id}`);
                if (raw) {
                    try {
                        const data = JSON.parse(raw);
                        ['standard', 'special', 'new-player'].forEach(cat => { if (data[cat]?.pulls) localTotal += data[cat].pulls.length; });
                    } catch (e) {}
                }
            }
        });

        const userRef = doc(db, "users", currentUser.uid);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
        const docSnap = await Promise.race([getDoc(userRef), timeoutPromise]);

        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            const cloudLastUpdated = cloudData.lastUpdated?.toMillis() || 0;
            const cloudTotal = cloudData.stats?.totalPulls || 0;
            let cloudFullBackup = null;
            try { cloudFullBackup = JSON.parse(cloudData.jsonData); } catch (e) {}

            console.log(`📊 Check: Local(${localTotal}) vs Cloud(${cloudTotal}).`);

            if (localTotal === cloudTotal) {
                if (localLastUpdated === 0 && cloudLastUpdated > 0) localStorage.setItem("ark_last_sync", cloudLastUpdated.toString());
                syncStatus.set("synced");
                return;
            }

            if (localTotal > cloudTotal) {
                setConflict(cloudFullBackup, cloudLastUpdated, cloudTotal, "local_newer");
                return;
            }
            if (cloudTotal > localTotal) {
                 setConflict(cloudFullBackup, cloudLastUpdated, cloudTotal, "conflict_cloud_newer");
                 return;
            }
            const diff = cloudLastUpdated - localLastUpdated;
            if (Math.abs(diff) > 10000) {
                 if (diff > 0) setConflict(cloudFullBackup, cloudLastUpdated, cloudTotal, "conflict_cloud_newer");
                 else setConflict(cloudFullBackup, cloudLastUpdated, cloudTotal, "local_newer");
                 return;
            }
            syncStatus.set("synced");
        } else {
            syncStatus.set("local_newer");
        }
    } catch (e) {
        console.warn("Sync warn:", e);
        syncStatus.set("local_newer");
    }
}

function setConflict(backup, time, total, status) {
    cloudDataBuffer.set({ fullBackup: backup, timestamp: time, total: total });
    syncStatus.set(status);
}

export function applyCloudData() {
    const buffer = get(cloudDataBuffer);
    if (!buffer || !buffer.fullBackup) return;
    const { meta, data } = buffer.fullBackup;
    try {
        if (meta && meta.accounts) {
            localStorage.setItem("ark_tracker_accounts", JSON.stringify({ accounts: meta.accounts, selectedId: meta.selectedId || 'main' }));
            try {
                if (accountStore.accounts) accountStore.accounts.set(meta.accounts);
                if (accountStore.selectAccount && meta.selectedId) accountStore.selectAccount(meta.selectedId);
            } catch(err) {}
        }
        if (data) {
            Object.entries(data).forEach(([accId, accData]) => {
                localStorage.setItem(`ark_tracker_data_${accId}`, JSON.stringify(accData));
            });
        }
        localStorage.setItem("ark_last_sync", buffer.timestamp.toString());
        syncStatus.set("synced");
        cloudDataBuffer.set(null);
        window.location.reload(); 
    } catch (e) { console.error("Restore failed", e); }
}

export async function uploadLocalData(freshSnapshot = null) {
    const currentUser = get(user);
    if (!currentUser || typeof window === 'undefined') return;

    console.log("🚀 Starting Upload...");

    try {
        let accounts = [];
        let selectedId = 'main';
        try {
            if (accountStore.accounts) accounts = get(accountStore.accounts);
            if (accountStore.selectedId) selectedId = get(accountStore.selectedId);
        } catch (e) {}

        if (!accounts || !accounts.length) {
            const raw = localStorage.getItem("ark_tracker_accounts");
            if (raw) { const p = JSON.parse(raw); accounts = p.accounts; selectedId = p.selectedId; }
            else { accounts = [{id: 'main', name: 'Main'}]; }
        }

        const fullBackup = { meta: { accounts, selectedId }, data: {} };
        let totalPulls = 0;
        let sixStars = 0;

        accounts.forEach(acc => {
            if (acc.id === selectedId && freshSnapshot) {
                fullBackup.data[acc.id] = freshSnapshot;
                console.log(`✅ Packed (Memory): ${acc.name}`);
                ['standard', 'special', 'new-player'].forEach(cat => {
                    const list = freshSnapshot[cat]?.pulls || [];
                    totalPulls += list.length;
                    sixStars += list.filter(p => p.rarity === 6).length;
                });
            } else {
                const rawData = localStorage.getItem(`ark_tracker_data_${acc.id}`);
                if (rawData) {
                    const parsed = JSON.parse(rawData);
                    fullBackup.data[acc.id] = parsed;
                    console.log(`✅ Packed (Disk): ${acc.name}`);
                    ['standard', 'special', 'new-player'].forEach(cat => {
                        const list = parsed[cat]?.pulls || [];
                        totalPulls += list.length;
                        sixStars += list.filter(p => p.rarity === 6).length;
                    });
                } else {
                    fullBackup.data[acc.id] = { standard: {pulls:[]}, special: {pulls:[]}, "new-player": {pulls:[]} };
                }
            }
        });

        console.log(`📦 Payload ready. Total: ${totalPulls}`);

        const jsonString = JSON.stringify(fullBackup);
        const userRef = doc(db, "users", currentUser.uid);
        
        await setDoc(userRef, {
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            jsonData: jsonString,
            lastUpdated: serverTimestamp(),
            stats: { totalPulls, sixStars, accountCount: accounts.length, lastPullDate: new Date().toISOString() }
        });

        localStorage.setItem("ark_last_sync", Date.now().toString());
        syncStatus.set("synced");
        if (analytics) logEvent(analytics, 'sync_upload', { total: totalPulls });

    } catch (e) {
        console.error("🔥 Upload error", e);
        syncStatus.set("error");
    }
}