import { writable, get } from "svelte/store";
import { auth, db, provider, analytics } from "$lib/firebase"; 
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { accountStore } from "$lib/stores/accounts"; 

// Состояние
export const user = writable(null);
export const syncStatus = writable("idle"); 
export const cloudDataBuffer = writable(null);

// === ХЕЛПЕР: Надежный подсчет локальных данных (без импортов сторов) ===
function countAllLocalPulls() {
    if (typeof window === 'undefined') return 0;
    
    let accounts = [];
    try {
        // Читаем только из LS, чтобы не зависеть от инициализации Svelte
        const raw = localStorage.getItem("ark_tracker_accounts");
        if (raw) {
            accounts = JSON.parse(raw).accounts;
        }
    } catch (e) { console.warn("LS read error", e); }
    
    // Если список пуст, проверяем дефолтный 'main'
    if (!accounts || accounts.length === 0) accounts = [{id: 'main'}];

    let total = 0;
    accounts.forEach(acc => {
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

// 3. ПРОВЕРКА СИНХРОНИЗАЦИИ (LOGIC V3)
export async function checkSync(currentUser) {
    if (!currentUser) return;
    syncStatus.set("checking");

    try {
        const localLastUpdated = parseInt(localStorage.getItem("ark_last_sync") || "0");
        const localTotal = countAllLocalPulls();

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

            // 1. РАВЕНСТВО: Если круток поровну - считаем, что все ок.
            if (localTotal === cloudTotal) {
                // Тихий фикс времени, если оно сбито
                if (localLastUpdated === 0 && cloudLastUpdated > 0) {
                     localStorage.setItem("ark_last_sync", cloudLastUpdated.toString());
                }
                syncStatus.set("synced");
                return;
            }

            // 2. БОЛЬШЕ = НОВЕЕ (Исправляет проблему после импорта)
            // Если локально данных БОЛЬШЕ, чем в облаке - значит мы их добавили.
            // Принудительно отправляем в облако.
            if (localTotal > cloudTotal) {
                console.log("📈 Local has MORE data. Auto-upload needed.");
                syncStatus.set("local_newer");
                return;
            }

            // 3. ЕСЛИ ЛОКАЛЬНО МЕНЬШЕ (или 0)
            // Тут уже смотрим на время, вдруг мы удалили лишнее, или это новый девайс.
            
            // Если локально 0, а в облаке есть -> Скачать
            if (localTotal === 0 && cloudTotal > 0) {
                setConflict(cloudFullBackup, cloudLastUpdated, cloudTotal, "conflict_cloud_newer");
                return;
            }

            const diff = cloudLastUpdated - localLastUpdated;

            // Если Облако новее по времени (и данных там больше)
            if (diff > 10000) {
                 setConflict(cloudFullBackup, cloudLastUpdated, cloudTotal, "conflict_cloud_newer");
                 return;
            }
            
            // Если локально новее по времени (но данных меньше - например удалили)
            if (diff < -10000) {
                syncStatus.set("local_newer");
                return;
            }

            syncStatus.set("synced");

        } else {
            // Новый юзер
            syncStatus.set("local_newer");
        }
    } catch (e) {
        console.warn("Sync warn:", e);
        syncStatus.set("local_newer"); // При ошибке сети даем возможность загрузить
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
            // Пытаемся обновить стор, если он доступен
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
        // 1. Собираем данные. Пытаемся через стор, если нет - через LS
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
            const key = `ark_tracker_data_${acc.id}`;
            const rawData = localStorage.getItem(key);
            
            if (rawData) {
                const parsed = JSON.parse(rawData);
                fullBackup.data[acc.id] = parsed;
                console.log(`✅ Packed: ${acc.name}`);

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