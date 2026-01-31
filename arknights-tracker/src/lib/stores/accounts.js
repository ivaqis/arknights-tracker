import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { currentUid } from './auth'; // Импортируем auth store

const ACCOUNTS_KEY = 'ark_tracker_accounts_meta';
const SELECTED_ID_KEY = 'ark_tracker_selected_account_id';

const defaultAccounts = [
    { id: 'main', name: 'Main Account', serverUid: null }
];

function generateId() {
    if (browser && self.crypto && self.crypto.randomUUID) {
        return self.crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function createAccountStore() {
    let initialAccounts = defaultAccounts;
    let initialSelected = 'main';

    if (browser) {
        // 1. Загружаем аккаунты
        const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);
        if (storedAccounts) {
            try {
                initialAccounts = JSON.parse(storedAccounts);
            } catch (e) { console.error(e); }
        }

        // 2. Загружаем выбранный ID
        const storedSelected = localStorage.getItem(SELECTED_ID_KEY);
        if (storedSelected && initialAccounts.find(a => a.id === storedSelected)) {
            initialSelected = storedSelected;
        } else {
            initialSelected = initialAccounts[0]?.id || 'main';
        }
    }

    const accounts = writable(initialAccounts);
    const selectedId = writable(initialSelected);

    // --- ФУНКЦИЯ СИНХРОНИЗАЦИИ ---
    // Находит текущий аккаунт и обновляет глобальный currentUid
    const syncAuthStore = (accts, selId) => {
        const currentAcc = accts.find(a => a.id === selId);
        if (currentAcc && currentAcc.serverUid) {
            console.log(`[Accounts] Switching to UID: ${currentAcc.serverUid}`);
            currentUid.set(currentAcc.serverUid);
            if (browser) localStorage.setItem("user_uid", currentAcc.serverUid); // Дублируем для надежности
        } else {
            console.log(`[Accounts] No Server UID for this account.`);
            // Если UID нет, генерируем временный или ставим null, но НЕ БЕРЕМ старый из LS
            currentUid.set(null); 
        }
    };

    if (browser) {
        // Сохраняем при изменениях
        accounts.subscribe(val => {
            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(val));
            // При изменении данных аккаунта (например, добавили UID) тоже синхроним
            syncAuthStore(val, get(selectedId));
        });

        selectedId.subscribe(val => {
            localStorage.setItem(SELECTED_ID_KEY, val);
            // При переключении аккаунта синхроним
            syncAuthStore(get(accounts), val);
        });
    }

    return {
        accounts,
        selectedId,

        addAccount: () => {
            accounts.update(list => {
                const regex = /^Account (\d+)$/;
                let maxNum = 0;
                list.forEach(acc => {
                    const match = acc.name.match(regex);
                    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
                });

                const newId = generateId();
                const newAccount = { 
                    id: newId, 
                    name: `Account ${maxNum + 1}`,
                    serverUid: null // Новый аккаунт чист
                };
                
                selectedId.set(newId);
                return [...list, newAccount];
            });
        },

        deleteAccount: (idToDelete) => {
            const currentList = get(accounts);
            if (currentList.length <= 1) return;

            if (browser) {
                localStorage.removeItem(`ark_tracker_data_${idToDelete}`);
            }

            const newList = currentList.filter(a => a.id !== idToDelete);
            accounts.set(newList);

            const currentSelected = get(selectedId);
            if (currentSelected === idToDelete) {
                selectedId.set(newList[0].id);
            }
        },

        selectAccount: (id) => {
            selectedId.set(id);
        },
        
        // === [FIX] СОХРАНЕНИЕ UID ===
        // Вызываем это при успешном импорте
        setServerUid: (serverUid) => {
            const currentSelected = get(selectedId);
            console.log(`[Accounts] Linking UID ${serverUid} to Account ${currentSelected}`);
            
            accounts.update(list => {
                return list.map(acc => {
                    if (acc.id === currentSelected) {
                        return { ...acc, serverUid: serverUid };
                    }
                    return acc;
                });
            });
            // syncAuthStore вызовется автоматически через subscribe
        },

        clearCurrentData: () => {
             const current = get(selectedId);
             if (browser && current) {
                 localStorage.removeItem(`ark_tracker_data_${current}`);
                 window.dispatchEvent(new CustomEvent('ark_tracker_clear_data', { detail: { id: current } }));
             }
        }
    };
}

export const accountStore = createAccountStore();