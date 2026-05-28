// src/lib/stores/pulls.js

import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { mergePulls, calculatePity, calculateBannerStats, validateAccountConsistency, findLCSMatches } from '$lib/utils/importUtils';
import { accountStore } from './accounts';
import { uploadLocalData, user } from "$lib/stores/cloudStore";

const defaultData = {
    "standard": { pulls: [], stats: {} },
    "special": { pulls: [], stats: {} },
    "new-player": { pulls: [], stats: {} },
    "joint": { pulls: [], stats: {} }
};

const nameFixes = {
    "Contingent Measure": "Prominent Edge",
};

function createPullStore() {
    const { subscribe, set, update } = writable(JSON.parse(JSON.stringify(defaultData)));

    let currentAccountId = null;

    const resetStore = () => {
        set(JSON.parse(JSON.stringify(defaultData)));
    };

    const restoreDatesAndStats = (data, serverId) => {
        if (!data || typeof data !== 'object') return;

        Object.keys(data).forEach(key => {
            if (data[key] && Array.isArray(data[key].pulls)) {
                data[key].pulls.forEach(p => {
                    if (p.time) p.time = new Date(p.time);

                    if (p.name === "Contingent Measure") {
                        p.name = "Prominent Edge";
                    }
                });
                
                if (serverId) {
                    data[key].pulls = calculatePity(data[key].pulls, key, serverId);
                }
                
                data[key].stats = calculateBannerStats(data[key].pulls, key, serverId);
            }
        });
    };

    const saveDataToStorage = (id, data) => {
        if (browser && id) {
            try {
                localStorage.setItem(`ark_tracker_data_${id}`, JSON.stringify(data));
            } catch (e) {
                console.error("Failed to save to localStorage:", e);
            }
        }
    };


    const loadDataForAccount = (id, serverId = '3') => {
        if (!browser) return;

        currentAccountId = id;
        const storageKey = `ark_tracker_data_${id}`;

        try {
            const stored = localStorage.getItem(storageKey);

            if (stored) {
                const parsed = JSON.parse(stored);
                restoreDatesAndStats(parsed, serverId);
                set(parsed);
            } else {
                const legacyData = localStorage.getItem('ark_tracker_pulls');

                if (legacyData && id === 'main') {
                    console.log("Migrating legacy data to Main account...");
                    const parsedLegacy = JSON.parse(legacyData);
                    restoreDatesAndStats(parsedLegacy, serverId);
                    set(parsedLegacy);

                    saveDataToStorage(id, parsedLegacy);
                    localStorage.removeItem('ark_tracker_pulls');
                } else {
                    resetStore();
                }
            }
        } catch (e) {
            console.error("Critical error loading account data:", e);
            resetStore();
        }
    };

    if (browser) {
        accountStore.selectedId.subscribe(id => {
            if (id) {
                const allAccounts = get(accountStore.accounts);
                const currentAcc = allAccounts.find(a => a.id === id);
                const sId = currentAcc?.serverId || '3';

                loadDataForAccount(id, sId);
            }
        });

        window.addEventListener('ark_tracker_clear_data', (e) => {
            if (e.detail && e.detail.id === currentAccountId) {
                resetStore();
            }
        });
    }
    return {
        subscribe,
        set,
        update,
        smartImport: async (newPulls, serverId = '3', commit = true, isRecoveryEnabled = false) => {
            if (!browser) return;

            newPulls.forEach(p => {
                if (nameFixes[p.name]) {
                    p.name = nameFixes[p.name];
                }
            });

            await new Promise(r => setTimeout(r, 100));

            return new Promise((resolve, reject) => {
                update(currentData => {
                    try {
                        const newData = JSON.parse(JSON.stringify(currentData));
                        restoreDatesAndStats(newData, serverId);

                        const report = { status: 'up_to_date', addedCount: {}, totalAdded: 0 };

                        const allCurrentPulls = [];
                        Object.entries(newData).forEach(([key, val]) => {
                            if (val && Array.isArray(val.pulls)) {
                                allCurrentPulls.push(...val.pulls);
                            }
                        });

                        if (allCurrentPulls.length > 0) {
                            validateAccountConsistency(allCurrentPulls, newPulls, isRecoveryEnabled);
                        }

                        const incomingByBanner = {};
                        newPulls.forEach(p => {
                            const bid = p.bannerId || 'standard';
                            if (!incomingByBanner[bid]) incomingByBanner[bid] = [];
                            incomingByBanner[bid].push(p);
                        });

                        let hasUpdates = false;

                        Object.keys(incomingByBanner).forEach(bid => {
                            let targetKey = bid;
                            const isKnownKey = newData[bid] || bid === 'standard' || bid === 'special' || bid === 'new-player' || bid === 'joint';
                            const isWeaponKey = bid.includes('weapon') || bid.includes('wepon') || bid.includes('constant');

                            if (!isKnownKey && !isWeaponKey) {
                                targetKey = 'standard';
                            }

                            if (!newData[targetKey]) {
                                newData[targetKey] = { pulls: [], stats: {} };
                            }

                            const oldList = newData[targetKey].pulls;
                            const incomeList = incomingByBanner[bid];

                            let hasEnriched = isRecoveryEnabled;
                            if (isRecoveryEnabled) {
                                const matches = findLCSMatches(oldList, incomeList);
                                matches.forEach(m => {
                                    const oldP = m.oldPull;
                                    const newP = m.newPull;
                                    oldP.id = newP.id;
                                    oldP.time = newP.time;
                                    oldP.seqId = newP.seqId;
                                    oldP.rawPoolId = newP.rawPoolId;
                                    oldP.isNew = newP.isNew;
                                    oldP.isFree = newP.isFree;
                                    oldP.type = newP.type;
                                });
                            }

                            oldList.forEach(oldP => {
                                const freshP = incomeList.find(p => p.id === oldP.id);
                                if (freshP) {
                                    if (!oldP.rawPoolId && freshP.rawPoolId) { oldP.rawPoolId = freshP.rawPoolId; hasEnriched = true; }
                                    if (!oldP.type && freshP.type) { oldP.type = freshP.type; hasEnriched = true; }
                                    if (oldP.isNew === undefined && freshP.isNew !== undefined) { oldP.isNew = freshP.isNew; hasEnriched = true; }
                                }
                            });

                            const oldCounts = {};
                            oldList.forEach(p => {
                                const sig = `${p.time.getTime()}_${p.name}`;
                                oldCounts[sig] = (oldCounts[sig] || 0) + 1;
                            });
                            const reallyNew = [];
                            const newCounts = {};
                            incomeList.forEach(p => {
                                const sig = `${p.time.getTime()}_${p.name}`;
                                newCounts[sig] = (newCounts[sig] || 0) + 1;
                                if (newCounts[sig] > (oldCounts[sig] || 0)) {
                                    reallyNew.push(p);
                                }
                            });

                            if (reallyNew.length > 0 || hasEnriched) {
                                const mergedList = mergePulls(oldList, reallyNew);

                                const pullsWithPity = calculatePity(mergedList, targetKey, serverId);
                                newData[targetKey].pulls = pullsWithPity;
                                newData[targetKey].stats = calculateBannerStats(pullsWithPity, targetKey, serverId);

                                report.addedCount[targetKey] = (report.addedCount[targetKey] || 0) + reallyNew.length;
                                report.totalAdded += reallyNew.length;
                                hasUpdates = true;
                            }
                        });

                        if (hasUpdates) {
                            report.status = 'updated';

                            if (commit) {
                                saveDataToStorage(currentAccountId, newData);
                                if (browser) localStorage.setItem("ark_last_sync", Date.now().toString());
                                if (get(user)) {
                                    uploadLocalData();
                                }
                                resolve(report);
                                return newData;
                            } else {
                                resolve(report);
                                return currentData;
                            }
                        } else {
                            resolve(report);
                            return currentData;
                        }

                    } catch (error) {
                        console.error("Smart Import Error:", error);
                        reject(error);
                        return currentData;
                    }
                });
            });
        }
    };
}

export const pullData = createPullStore();