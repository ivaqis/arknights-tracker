import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

const ACCOUNTS_KEY = 'ark_tracker_accounts_meta';
const SELECTED_ID_KEY = 'ark_tracker_selected_account_id';

const defaultAccounts = [
    { id: 'main', name: 'Main Account' }
];

// Функция генерации ID, которая работает везде (даже на HTTP)
function generateId() {
    if (browser && self.crypto && self.crypto.randomUUID) {
        return self.crypto.randomUUID();
    }
    // Fallback для старых браузеров или HTTP контекста
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function createAccountStore() {
    let initialAccounts = defaultAccounts;
    let initialSelected = 'main';

    if (browser) {
        const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);
        if (storedAccounts) {
            try {
                initialAccounts = JSON.parse(storedAccounts);
            } catch (e) { console.error(e); }
        }

        const storedSelected = localStorage.getItem(SELECTED_ID_KEY);
        // Проверяем, существует ли сохраненный ID в списке аккаунтов
        if (storedSelected && initialAccounts.find(a => a.id === storedSelected)) {
            initialSelected = storedSelected;
        } else {
            initialSelected = initialAccounts[0]?.id || 'main';
        }
    }

    const accounts = writable(initialAccounts);
    const selectedId = writable(initialSelected);

    if (browser) {
        accounts.subscribe(val => localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(val)));
        selectedId.subscribe(val => localStorage.setItem(SELECTED_ID_KEY, val));
    }

    return {
        accounts,
        selectedId,

        // УМНОЕ ДОБАВЛЕНИЕ (фикс crypto.randomUUID)
        addAccount: () => {
            accounts.update(list => {
                const regex = /^Account (\d+)$/;
                let maxNum = 0;

                list.forEach(acc => {
                    const match = acc.name.match(regex);
                    if (match) {
                        const num = parseInt(match[1], 10);
                        if (num > maxNum) maxNum = num;
                    }
                });

                const nextNum = maxNum + 1;
                const newId = generateId(); // Используем нашу безопасную функцию
                
                const newAccount = { 
                    id: newId, 
                    name: `Account ${nextNum}` 
                };
                
                // Сразу переключаем на новый
                selectedId.set(newId);
                
                return [...list, newAccount];
            });
        },

        // БЕЗОПАСНОЕ УДАЛЕНИЕ
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
                const mainExists = newList.find(a => a.id === 'main');
                selectedId.set(mainExists ? 'main' : newList[0].id);
            }
        },

        selectAccount: (id) => {
            selectedId.set(id);
        },
        
        // Очистка данных (проверьте, что вызываете именно этот метод в settings/+page.svelte)
        clearCurrentData: () => {
             const current = get(selectedId);
             if (browser && current) {
                 localStorage.removeItem(`ark_tracker_data_${current}`);
                 // Диспатчим событие для обновления pulls.js
                 window.dispatchEvent(new CustomEvent('ark_tracker_clear_data', { detail: { id: current } }));
             }
        },

        setServerUid: (serverUid) => {
            const currentSelected = get(selectedId);
            accounts.update(list => {
                return list.map(acc => {
                    if (acc.id === currentSelected) {
                        // Добавляем/Обновляем поле serverUid у текущего аккаунта
                        return { ...acc, serverUid: serverUid };
                    }
                    return acc;
                });
            });
        },

        // === [НОВОЕ] Получение Server UID текущего аккаунта ===
        getCurrentServerUid: () => {
             const currentSelected = get(selectedId);
             const list = get(accounts);
             const acc = list.find(a => a.id === currentSelected);
             return acc ? acc.serverUid : null;
        }
    };
}

export const accountStore = createAccountStore();