// src/lib/stores/pulls.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { mergePulls, calculatePity, calculateBannerStats } from '$lib/utils/importUtils';

const defaultData = {
    standard: { pulls: [], stats: {} },
    special: { pulls: [], stats: {} },
    new_player: { pulls: [], stats: {} }
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
                        // Восстанавливаем даты и пересчитываем статы (на случай обновления логики)
                        Object.keys(parsed).forEach(key => {
                            if (parsed[key].pulls) {
                                parsed[key].pulls.forEach(p => p.time = new Date(p.time));
                                // Пересчитываем статы при инициализации, чтобы применить новые правила (30-40)
                                parsed[key].stats = calculateBannerStats(parsed[key].pulls, key);
                            }
                        });
                        set(parsed);
                    } catch (e) {
                        console.error("Cache error", e);
                    }
                }
            }
        },

        smartImport: async (newPulls) => {
            await new Promise(r => setTimeout(r, 500));

            return new Promise((resolve) => {
                update(currentData => {
                    const newData = JSON.parse(JSON.stringify(currentData));
                    Object.keys(newData).forEach(k => {
                        if(newData[k].pulls) newData[k].pulls.forEach(p => p.time = new Date(p.time));
                    });

                    const report = { status: 'up_to_date', addedCount: {}, totalAdded: 0 };
                    
                    // Группировка по баннерам
                    const incomingByBanner = {};
                    newPulls.forEach(p => {
                        // Нормализация ID баннера к нашим ключам
                        let bid = p.bannerId ? p.bannerId.toLowerCase() : 'standard';
                        
                        if (bid.includes('new') || bid.includes('beginner')) bid = 'new_player';
                        else if (bid.includes('special') || bid.includes('limited') || bid.includes('event')) bid = 'special';
                        else bid = 'standard'; // Всё остальное кидаем в стандарт, чтобы не терять

                        if (!incomingByBanner[bid]) incomingByBanner[bid] = [];
                        incomingByBanner[bid].push(p);
                    });

                    let hasUpdates = false;

                    Object.keys(incomingByBanner).forEach(bid => {
                        if (!newData[bid]) newData[bid] = { pulls: [], stats: {} };

                        const oldList = newData[bid].pulls;
                        const incomeList = incomingByBanner[bid];
                        
                        // Фильтрация дублей по ID
                        const existingIds = new Set(oldList.map(p => p.id));
                        const reallyNew = incomeList.filter(p => !existingIds.has(p.id));

                        if (reallyNew.length > 0) {
                            // 1. Мержим
                            const mergedList = mergePulls(oldList, reallyNew);
                            
                            // 2. Считаем Pity (передаем bid для проверки isSpecial)
                            const pullsWithPity = calculatePity(mergedList, bid);
                            newData[bid].pulls = pullsWithPity;

                            // 3. Считаем статистику
                            newData[bid].stats = calculateBannerStats(pullsWithPity, bid);

                            report.addedCount[bid] = reallyNew.length;
                            report.totalAdded += reallyNew.length;
                            hasUpdates = true;
                        }
                    });

                    if (hasUpdates) {
                        report.status = 'updated';
                        if (browser) localStorage.setItem('ark_tracker_pulls', JSON.stringify(newData));
                    }

                    resolve(report);
                    return newData;
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