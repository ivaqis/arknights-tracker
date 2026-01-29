import { writable, get } from "svelte/store";
import { auth, db, provider, analytics } from "$lib/firebase"; 
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { accountStore } from "$lib/stores/accounts"; 
import { pullData } from "$lib/stores/pulls"; // <--- ДОБАВЬ ЭТОТ ИМПОРТ

// Состояние
export const user = writable(null);
export const syncStatus = writable("idle"); 
export const cloudDataBuffer = writable(null);

// === ХЕЛПЕР: Умный подсчет (Память + Диск) ===
function countAllLocalPulls() {
    if (typeof window === 'undefined') return 0;
    
    let total = 0;
    let accounts = [];
    let currentId = 'main';

    // 1. Пытаемся взять список аккаунтов из Стора (самый свежий)
    try {
        const storeAccs = get(accountStore.accounts);
        if (storeAccs && storeAccs.length > 0) {
            accounts = storeAccs;
            currentId = get(accountStore.selectedId);
        } else {
            throw new Error("Store empty");
        }
    } catch (e) {
        // Фоллбэк на localStorage
        try {
            const raw = localStorage.getItem("ark_tracker_accounts");
            if (raw) accounts = JSON.parse(raw).accounts;
        } catch (err) {}
    }

    if (!accounts || accounts.length === 0) accounts = [{id: 'main'}];

    // 2. Считаем крутки
    accounts.forEach(acc => {
        // ГЛАВНЫЙ ФИКС: Если это текущий аккаунт, берем данные из pullData (это то, что на экране!)
        if (acc.id === currentId) {
            const currentPulls = get(pullData);
            if (currentPulls) {
                ['standard', 'special', 'new-player'].forEach(cat => {
                    if (currentPulls[cat]?.pulls) total += currentPulls[cat].pulls.length;
                });
                return; // Переходим к следующему аккаунту
            }
        }

        // Иначе читаем с диска
        const raw = localStorage.getItem(`ark_tracker_data_${acc.id}`);
        if (raw) {
            try {
                const data = JSON.parse(raw);
                ['standard', 'special', 'new-player'].forEach(cat => {
                    if (data[cat]?.pulls) total += data[cat].pulls.length;
                });
            } catch (e) {}
        }
    });

    return total;
}

// 1. Инициализация
export function initAuth() {
    onAuthStateChanged(auth, (u) => {
        user.set(u);
        if (u) {
            checkSync(u);
            if (analytics) logEvent(analytics, 'login', { method: 'google' });
        }
    });
}

// 2. Вход / Выход
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

// 3. ПРОВЕРКА СИНХРОНИЗАЦИИ
export async function checkSync(currentUser, overrideLocalTotal = null) {
    if (!currentUser) return;
    syncStatus.set("checking");

    try {
        const localLastUpdated = parseInt(localStorage.getItem("ark_last_sync") || "0");
        
        // Если передали вручную - берем его, иначе считаем Умным способом
        let localTotal = overrideLocalTotal !== null ? overrideLocalTotal : countAllLocalPulls();

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

            // 1. РАВЕНСТВО
            if (localTotal === cloudTotal) {
                if (localLastUpdated === 0 && cloudLastUpdated > 0) {
                     localStorage.setItem("ark_last_sync", cloudLastUpdated.toString());
                }
                syncStatus.set("synced");
                return;
            }

            // 2. РАЗЛИЧИЯ
            if (localTotal > cloudTotal) {
                console.log("📈 Local is NEWER (more pulls). Asking user...");
                setConflict(cloudFullBackup, cloudLastUpdated, cloudTotal, "local_newer");
                return;
            }

            if (cloudTotal > localTotal) {
                 console.log("☁️ Cloud is NEWER (more pulls). Asking user...");
                 setConflict(cloudFullBackup, cloudLastUpdated, cloudTotal, "conflict_cloud_newer");
                 return;
            }

            // Время
            const diff = cloudLastUpdated - localLastUpdated;
            if (Math.abs(diff) > 10000) {
                 if (diff > 0) {
                     setConflict(cloudFullBackup, cloudLastUpdated, cloudTotal, "conflict_cloud_newer");
                 } else {
                     setConflict(cloudFullBackup, cloudLastUpdated, cloudTotal, "local_newer");
                 }
                 return;
            }
            
            syncStatus.set("synced");

        } else {
            // Новый юзер
            syncStatus.set("local_newer");
        }
    } catch (e) {
        console.warn("Sync warn:", e);
        syncStatus.set("local_newer");
    }
}

function setConflict(backup, time, total, status) {
    cloudDataBuffer.set({
        fullBackup: backup,
        timestamp: time,
        total: total
    });
    syncStatus.set(status);
}

// 4. DOWNLOAD
export function applyCloudData() {
    const buffer = get(cloudDataBuffer);
    if (!buffer || !buffer.fullBackup) return;

    console.log("📥 Restoring...");
    const { meta, data } = buffer.fullBackup;

    try {
        if (meta && meta.accounts) {
            localStorage.setItem("ark_tracker_accounts", JSON.stringify({
                accounts: meta.accounts,
                selectedId: meta.selectedId || 'main'
            }));
            try {
                if (accountStore.accounts) accountStore.accounts.set(meta.accounts);
                if (accountStore.selectAccount && meta.selectedId) accountStore.selectAccount(meta.selectedId);
            } catch(err) { console.warn("Store update warn", err); }
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

    } catch (e) {
        console.error("Restore failed", e);
    }
}

// 5. UPLOAD
export async function uploadLocalData() {
    const currentUser = get(user);
    if (!currentUser || typeof window === 'undefined') return;

    console.log("🚀 Starting Upload...");

    try {
        // [FIX] При Upload тоже берем данные из Стора, чтобы не загрузить старье с диска
        let accounts = [];
        let selectedId = 'main';

        try {
            if (accountStore.accounts) accounts = get(accountStore.accounts);
            if (accountStore.selectedId) selectedId = get(accountStore.selectedId);
        } catch (e) {}

        if (!accounts || accounts.length === 0) {
            const raw = localStorage.getItem("ark_tracker_accounts");
            if (raw) {
                const parsed = JSON.parse(raw);
                accounts = parsed.accounts;
                selectedId = parsed.selectedId;
            } else {
                accounts = [{id: 'main', name: 'Main'}];
            }
        }

        const fullBackup = {
            meta: { accounts, selectedId },
            data: {}
        };

        let totalPulls = 0;
        let sixStars = 0;

        accounts.forEach(acc => {
            // Если аккаунт активный - берем из Store
            if (acc.id === selectedId) {
                const currentData = get(pullData);
                if (currentData) {
                    fullBackup.data[acc.id] = currentData;
                    console.log(`✅ Packed (Memory): ${acc.name}`);
                    ['standard', 'special', 'new-player'].forEach(cat => {
                        const list = currentData[cat]?.pulls || [];
                        totalPulls += list.length;
                        sixStars += list.filter(p => p.rarity === 6).length;
                    });
                    return;
                }
            }

            // Иначе с диска
            const key = `ark_tracker_data_${acc.id}`;
            const rawData = localStorage.getItem(key);
            
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
        });

        console.log(`📦 Payload ready. Total pulls: ${totalPulls}`);

        const jsonString = JSON.stringify(fullBackup);
        const userRef = doc(db, "users", currentUser.uid);
        
        await setDoc(userRef, {
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            jsonData: jsonString,
            lastUpdated: serverTimestamp(),
            stats: {
                totalPulls,
                sixStars,
                accountCount: accounts.length,
                lastPullDate: new Date().toISOString()
            }
        });

        localStorage.setItem("ark_last_sync", Date.now().toString());
        syncStatus.set("synced");

        if (analytics) logEvent(analytics, 'sync_upload', { total: totalPulls });

    } catch (e) {
        console.error("🔥 Upload error", e);
        syncStatus.set("error");
    }
}