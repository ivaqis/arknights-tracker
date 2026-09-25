import { writable, get } from "svelte/store";
import { browser } from "$app/environment";
import {
    mergePulls,
    mergePullsWithReport,
    isWeaponBanner,
    calculatePity,
    calculateBannerStats,
    validateAccountConsistency,
    findLCSMatches,
    canonicalizeName
} from "$lib/utils/importUtils";
import { accountStore } from "./accounts";
import { uploadLocalData, user } from "$lib/stores/cloudStore";

const defaultData = {
    "standard": { pulls: [], stats: {} },
    "special": { pulls: [], stats: {} },
    "new-player": { pulls: [], stats: {} },
    "joint": { pulls: [], stats: {} },
    "rerun": { pulls: [], stats: {} }
};

function createPullStore() {
    const { subscribe, set, update } = writable(JSON.parse(JSON.stringify(defaultData)));

    let currentAccountId = null;

    const resetStore = () => {
        set(JSON.parse(JSON.stringify(defaultData)));
    };

    const migrateLegacyRerunPulls = (data) => {
        if (!data || typeof data !== "object")
            return false;

        let modified = false;

        if (data.special && Array.isArray(data.special.pulls)) {
            const rerunPullsToMove = [];
            const remainingSpecialPulls = [];

            for (const p of data.special.pulls) {
                const rawPool = String(p.rawPoolId || "").toLowerCase();
                const bannerId = String(p.bannerId || "").toLowerCase();
                const isRerunPull =
                    rawPool === "special_1_5_2" ||
                    rawPool === "rerun_chr_yvonne" ||
                    rawPool.includes("rerun") ||
                    bannerId === "special_1_5_2" ||
                    bannerId === "rerun_chr_yvonne" ||
                    (bannerId.includes("rerun") && !bannerId.includes("weap"));

                if (isRerunPull) {
                    p.bannerId = "rerun";
                    rerunPullsToMove.push(p);
                    modified = true;
                } else {
                    remainingSpecialPulls.push(p);
                }
            }

            if (rerunPullsToMove.length > 0) {
                data.special.pulls = remainingSpecialPulls;
                if (!data.rerun) {
                    data.rerun = { pulls: [], stats: {} };
                }
                data.rerun.pulls = mergePulls(data.rerun.pulls || [], rerunPullsToMove);
            }
        }

        if (data["special_1_5_2"] && Array.isArray(data["special_1_5_2"].pulls)) {
            const charPullsToMove = data["special_1_5_2"].pulls.map(p => ({
                ...p,
                bannerId: "rerun"
            }));
            if (!data.rerun) {
                data.rerun = { pulls: [], stats: {} };
            }
            data.rerun.pulls = mergePulls(data.rerun.pulls || [], charPullsToMove);
            delete data["special_1_5_2"];
            modified = true;
        }

        if (data["weponbox_1_5_2"] && Array.isArray(data["weponbox_1_5_2"].pulls)) {
            const weaponPullsToMove = data["weponbox_1_5_2"].pulls.map(p => ({
                ...p,
                bannerId: "rerun_wpn_yvonne",
                rawPoolId: p.rawPoolId === "weponbox_1_5_2" ? "rerun_wpn_yvonne" : p.rawPoolId
            }));

            if (!data["rerun_wpn_yvonne"]) {
                data["rerun_wpn_yvonne"] = { pulls: [], stats: {} };
            }
            data["rerun_wpn_yvonne"].pulls = mergePulls(data["rerun_wpn_yvonne"].pulls || [], weaponPullsToMove);
            delete data["weponbox_1_5_2"];
            modified = true;
        }

        return modified;
    };

    const restoreDatesAndStats = (data, serverId) => {
        if (!data || typeof data !== "object")
            return;

        migrateLegacyRerunPulls(data);

        Object.keys(data).forEach(key => {
            if (data[key] && Array.isArray(data[key].pulls)) {
                data[key].pulls = data[key].pulls.filter(p => {
                    if (!p || !p.name || p.name === "undefined" || p.name === "null")
                        return false;

                    if (!p.time)
                        return false;

                    const d = new Date(p.time);

                    if (Number.isNaN(d.getTime()) || d.getFullYear() < 2000)
                        return false;

                    return true;
                });

                data[key].pulls.forEach(p => {
                    p.time = new Date(p.time);
                    p.name = canonicalizeName(p.name);
                });

                data[key].pulls = mergePulls(data[key].pulls, []);

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


    const loadDataForAccount = (id, serverId = "3") => {
        if (!browser)
            return;

        currentAccountId = id;

        const storageKey = `ark_tracker_data_${id}`;

        try {
            const stored = localStorage.getItem(storageKey);

            if (stored) {
                const parsed = JSON.parse(stored);
                const wasMigrated = migrateLegacyRerunPulls(parsed);

                restoreDatesAndStats(parsed, serverId);
                set(parsed);

                if (wasMigrated) {
                    saveDataToStorage(id, parsed);
                }
            } else {
                const legacyData = localStorage.getItem("ark_tracker_pulls");

                if (legacyData && id === "main") {
                    const parsedLegacy = JSON.parse(legacyData);

                    restoreDatesAndStats(parsedLegacy, serverId);
                    set(parsedLegacy);

                    saveDataToStorage(id, parsedLegacy);
                    localStorage.removeItem("ark_tracker_pulls");
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
                const sId = currentAcc?.serverId || "3";

                loadDataForAccount(id, sId);
            }
        });

        window.addEventListener("ark_tracker_clear_data", (e) => {
            if (e.detail && e.detail.id === currentAccountId) {
                resetStore();
            }
        });
    }
    return {
        subscribe,
        set,
        update,
        smartImport: async (newPulls, serverId = "3", commit = true, isRecoveryEnabled = false) => {
            if (!browser)
                return;

            const cleanIncoming = (newPulls || []).map(p => ({
                ...p,
                name: canonicalizeName(p.name)
            }));

            return new Promise((resolve, reject) => {
                update(currentData => {
                    try {
                        const newData = JSON.parse(JSON.stringify(currentData));

                        restoreDatesAndStats(newData, serverId);

                        const report = {
                            status: "up_to_date",
                            addedCount: {},
                            totalAdded: 0
                        };

                        const allCurrentPulls = [];

                        Object.entries(newData).forEach(([key, val]) => {
                            if (val && Array.isArray(val.pulls)) {
                                allCurrentPulls.push(...val.pulls);
                            }
                        });

                        if (allCurrentPulls.length > 0) {
                            validateAccountConsistency(allCurrentPulls, cleanIncoming, isRecoveryEnabled);
                        }

                        const incomingByBanner = {};

                        cleanIncoming.forEach(p => {
                            const bid = p.bannerId || "standard";

                            if (!incomingByBanner[bid]) {
                                incomingByBanner[bid] = [];
                            }

                            incomingByBanner[bid].push(p);
                        });

                        let hasUpdates = false;

                        Object.keys(incomingByBanner).forEach(bannerId => {
                            let targetKey = bannerId;

                            const isKnownKey = newData[bannerId]
                                || bannerId === "standard"
                                || bannerId === "special"
                                || bannerId === "new-player"
                                || bannerId === "joint"
                                || bannerId === "rerun";
                            const isWeaponKey = isWeaponBanner(bannerId);

                            if (!isKnownKey && !isWeaponKey) {
                                targetKey = "standard";
                            }

                            if (!newData[targetKey]) {
                                newData[targetKey] = { pulls: [], stats: {} };
                            }

                            const oldList = newData[targetKey].pulls;
                            const incomeList = incomingByBanner[bannerId];

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

                            const {
                                merged: mergedList,
                                addedCount,
                                hasEnriched
                            } = mergePullsWithReport(oldList, incomeList);

                            if (addedCount > 0 || hasEnriched || isRecoveryEnabled) {
                                const pullsWithPity = calculatePity(mergedList, targetKey, serverId);

                                newData[targetKey].pulls = pullsWithPity;
                                newData[targetKey].stats = calculateBannerStats(pullsWithPity, targetKey, serverId);

                                report.addedCount[targetKey] = (report.addedCount[targetKey] || 0) + addedCount;
                                report.totalAdded += addedCount;
                                hasUpdates = true;
                            }
                        });

                        if (hasUpdates) {
                            report.status = "updated";

                            if (commit) {
                                saveDataToStorage(currentAccountId, newData);
                                if (browser) {
                                    localStorage.setItem("ark_last_sync", Date.now().toString());
                                }

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