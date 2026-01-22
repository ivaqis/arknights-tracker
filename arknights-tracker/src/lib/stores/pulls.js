// src/lib/stores/pulls.js
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { mergePulls, calculatePity } from '$lib/utils/importUtils'; // Импортируем calculatePity

const defaultData = {
    standard: { pulls: [], total: 0, pity6: 0, pity5: 0 },
    special: { pulls: [], total: 0, pity6: 0, pity5: 0 },
    new_player_banner: { pulls: [], total: 0, pity6: 0, pity5: 0 }
};

function createPullData() {
    const store = writable(defaultData);
    const { subscribe, set, update } = store;

    return {
        subscribe,
        
        init: () => {
            if (browser) {
                const stored = localStorage.getItem('ark_tracker_pulls');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        Object.keys(parsed).forEach(key => {
                            if (parsed[key].pulls) {
                                parsed[key].pulls.forEach(p => p.time = new Date(p.time));
                            }
                        });
                        set(parsed);
                    } catch (e) {
                        console.error("Ошибка чтения кеша", e);
                    }
                }
            }
        },

        smartImport: async (newPulls) => {
            await new Promise(r => setTimeout(r, 800));

            return new Promise((resolve, reject) => {
                update(currentData => {
                    const newData = { ...JSON.parse(JSON.stringify(currentData)) };
                    Object.keys(newData).forEach(k => newData[k].pulls.forEach(p => p.time = new Date(p.time)));

                    const report = {
                        status: 'up_to_date',
                        addedCount: {},
                        totalAdded: 0
                    };

                    const incomingByBanner = {};
                    newPulls.forEach(pull => {
                        const bid = pull.bannerId;
                        if (!incomingByBanner[bid]) incomingByBanner[bid] = [];
                        incomingByBanner[bid].push(pull);
                    });

                    let hasUpdates = false;

                    Object.keys(incomingByBanner).forEach(bid => {
                        if (!newData[bid]) {
                            newData[bid] = { pulls: [], total: 0, pity6: 0, pity5: 0 };
                        }

                        const oldList = newData[bid].pulls;
                        const incomeList = incomingByBanner[bid];
                        
                        const existingIds = new Set(oldList.map(p => p.id));
                        const reallyNew = incomeList.filter(p => !existingIds.has(p.id));

                        if (reallyNew.length > 0) {
                            const lastExistingDate = oldList.length > 0 ? oldList[oldList.length - 1].time : null;
                            const isOlder = lastExistingDate && reallyNew.some(p => new Date(p.time) < lastExistingDate);

                            if (isOlder) {
                                // report.status = 'error_account'; 
                                // return; 
                            }

                            // 1. Объединяем списки (сортировка внутри mergePulls)
                            let mergedList = mergePulls(oldList, reallyNew);
                            
                            // 2. ВЫЧИСЛЯЕМ PITY И СТАТУСЫ ДЛЯ ВСЕЙ ИСТОРИИ
                            // Пересчитываем весь список, так как вставка старой крутки меняет гаранты у всех последующих
                            newData[bid].pulls = calculatePity(mergedList, bid);

                            report.addedCount[bid] = reallyNew.length;
                            report.totalAdded += reallyNew.length;
                            hasUpdates = true;
                        }
                    });

                    if (report.status === 'error_account') {
                         return currentData; 
                    }

                    if (hasUpdates) {
                        report.status = 'updated';
                        
                        // Пересчитываем Total и текущий Pity (для шапки/виджета)
                        Object.keys(report.addedCount).forEach(bid => {
                            newData[bid].total = newData[bid].pulls.length;
                            
                            // Логика "текущего пити" (сколько откручено ПОСЛЕ последней леги)
                            let p6 = 0, p5 = 0;
                            const list = newData[bid].pulls;
                            for (let i = list.length - 1; i >= 0; i--) {
                                if (list[i].rarity === 6) break;
                                p6++;
                            }
                            for (let i = list.length - 1; i >= 0; i--) {
                                if (list[i].rarity >= 5) break;
                                p5++;
                            }
                            newData[bid].pity6 = p6;
                            newData[bid].pity5 = p5;
                        });

                        if (browser) {
                            localStorage.setItem('ark_tracker_pulls', JSON.stringify(newData));
                        }
                        
                        resolve(report);
                        return newData;
                    } else {
                        resolve(report);
                        return currentData;
                    }
                });
            });
        },

        clear: () => {
            set(defaultData);
            if (browser) localStorage.removeItem('ark_tracker_pulls');
        }
    };
}

export const pullData = createPullData();
