// src/lib/stores/accounts.js
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { currentUid } from './auth';

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
        const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);
        if (storedAccounts) {
            try {
                initialAccounts = JSON.parse(storedAccounts);
            } catch (e) { console.error(e); }
        }

        const storedSelected = localStorage.getItem(SELECTED_ID_KEY);
        if (storedSelected && initialAccounts.find(a => a.id === storedSelected)) {
            initialSelected = storedSelected;
        } else {
            initialSelected = initialAccounts[0]?.id || 'main';
        }
    }

    const accounts = writable(initialAccounts);
    const selectedId = writable(initialSelected);

    const syncAuthStore = (accts, selId) => {
        const currentAcc = accts.find(a => a.id === selId);
        
        if (currentAcc && currentAcc.serverUid) {
            console.log(`[Accounts] Switching to UID: ${currentAcc.serverUid}`);
            currentUid.set(currentAcc.serverUid);
            if (browser) localStorage.setItem("user_uid", currentAcc.serverUid);
        } else {
            console.log(`[Accounts] No Server UID for this account.`);
            currentUid.set(null); 
            if (browser) localStorage.removeItem("user_uid");
        }
    };

    if (browser) {
        accounts.subscribe(val => {
            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(val));
            syncAuthStore(val, get(selectedId));
        });

        selectedId.subscribe(val => {
            localStorage.setItem(SELECTED_ID_KEY, val);
            syncAuthStore(get(accounts), val);
        });
    }

    return {
        accounts,
        selectedId,

        createEmptyAccount: () => {
            accounts.update(list => {
                let maxNum = 0;
                const regex = /^Account\s+(\d+)$/;
                
                list.forEach(a => {
                    const match = a.name.match(regex);
                    if (match) {
                        const num = parseInt(match[1]);
                        if (num > maxNum) maxNum = num;
                    }
                });

                const newName = `Account ${maxNum + 1}`;
                const newId = generateId();
                
                const newAccount = {
                    id: newId,
                    name: newName,
                    serverUid: null,
                    serverId: '3'
                };

                selectedId.set(newId);
                
                return [...list, newAccount];
            });
        },

        addAccount: (gameUid, nickname, serverId = null) => {
            const effectiveServerId = serverId || '3';
            const currentSelectedId = get(selectedId);

            accounts.update(list => {
                const existingIndex = list.findIndex(a => a.serverUid === gameUid);
                if (existingIndex >= 0) {
                    const newList = [...list];
                    newList[existingIndex] = { 
                        ...newList[existingIndex], 
                        serverId: effectiveServerId 
                    };
                    selectedId.set(newList[existingIndex].id);
                    return newList;
                }

                const currentAccountIndex = list.findIndex(a => a.id === currentSelectedId);
                if (currentAccountIndex >= 0) {
                    const currentAcc = list[currentAccountIndex];
                    if (!currentAcc.serverUid) {
                        console.log(`Linking Game UID ${gameUid} to existing slot "${currentAcc.name}"`);
                        const newList = [...list];
                        newList[currentAccountIndex] = {
                            ...currentAcc,
                            serverUid: gameUid,
                            serverId: effectiveServerId,
                        };
                        return newList;
                    }
                }

                const newId = generateId(); 
                const newList = [...list, { 
                    id: newId, 
                    name: nickname || `Account ${list.length + 1}`,
                    serverId: effectiveServerId,
                    serverUid: gameUid 
                }];
                selectedId.set(newId);
                return newList;
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

        renameAccount: (id, newName) => {
            accounts.update(list => {
                return list.map(acc => {
                    if (acc.id === id) {
                        return { ...acc, name: newName };
                    }
                    return acc;
                });
            });
        },

        updateAccount: (id, updates) => {
            accounts.update(list => {
                return list.map(acc => {
                    if (acc.id === id) {
                        const newProps = {};
                        if (updates.name !== undefined) newProps.name = updates.name;
                        if (updates.uid !== undefined) newProps.serverUid = updates.uid;
                        if (updates.serverId !== undefined) newProps.serverId = updates.serverId;
                        
                        return { ...acc, ...newProps };
                    }
                    return acc;
                });
            });
            
            if (get(selectedId) === id && updates.uid) {
                 syncAuthStore(get(accounts), id);
            }
        },

        selectAccount: (id) => {
            selectedId.set(id);
        },
        
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
        },

        clearCurrentData: () => {
             const current = get(selectedId);
             if (browser && current) {
                 localStorage.removeItem(`ark_tracker_data_${current}`);
                 
                 accounts.update(list => {
                    return list.map(acc => {
                        if (acc.id === current) {
                            return { 
                                ...acc, 
                                serverUid: null,
                                serverId: '3'
                            };
                        }
                        return acc;
                    });
                 });

                 currentUid.set(null);
                 if (browser) localStorage.removeItem("user_uid");

                 window.dispatchEvent(new CustomEvent('ark_tracker_clear_data', { detail: { id: current } }));
                 console.log("Аккаунт полностью очищен.");
             }
        }
    };
}

export const accountStore = createAccountStore();