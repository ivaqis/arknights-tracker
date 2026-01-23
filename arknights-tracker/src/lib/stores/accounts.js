import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

const ACCOUNTS_KEY = 'ark_tracker_accounts_meta';
const SELECTED_ID_KEY = 'ark_tracker_selected_account_id';

const defaultAccounts = [
    { id: 'main', name: 'Main Account' }
];

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

        // УМНОЕ ДОБАВЛЕНИЕ (фикс дублей "Account 2")
        addAccount: () => {
            accounts.update(list => {
                // 1. Ищем все аккаунты, которые называются "Account N"
                const regex = /^Account (\d+)$/;
                let maxNum = 0;

                list.forEach(acc => {
                    const match = acc.name.match(regex);
                    if (match) {
                        const num = parseInt(match[1], 10);
                        if (num > maxNum) maxNum = num;
                    }
                });

                // 2. Следующий номер всегда Max + 1
                const nextNum = maxNum + 1;
                const newId = crypto.randomUUID();
                
                // (Здесь можно будет использовать i18n функцию для слова "Account", если нужно, но пока хардкод для логики)
                const newAccount = { 
                    id: newId, 
                    name: `Account ${nextNum}` 
                };
                
                // 3. Сразу переключаем на новый
                selectedId.set(newId);
                
                return [...list, newAccount];
            });
        },

        // БЕЗОПАСНОЕ УДАЛЕНИЕ
        deleteAccount: (idToDelete) => {
            const currentList = get(accounts);
            if (currentList.length <= 1) return; // Не удаляем последний

            // Чистим данные
            if (browser) {
                localStorage.removeItem(`ark_tracker_data_${idToDelete}`);
            }

            // Обновляем список
            const newList = currentList.filter(a => a.id !== idToDelete);
            accounts.set(newList);

            // Если мы удалили тот аккаунт, который был выбран -> переключаем на Main (или первый в списке)
            const currentSelected = get(selectedId);
            if (currentSelected === idToDelete) {
                // Пытаемся найти Main, если нет - берем первый попавшийся
                const mainExists = newList.find(a => a.id === 'main');
                selectedId.set(mainExists ? 'main' : newList[0].id);
            }
        },

        selectAccount: (id) => {
            selectedId.set(id);
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