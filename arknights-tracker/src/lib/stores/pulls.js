// src/lib/stores/pulls.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { mergePulls, calculatePity, calculateBannerStats } from '$lib/utils/importUtils';

// Структура данных теперь содержит объект stats внутри каждого баннера
const defaultData = {
    standard: { pulls: [], stats: {} },
    special: { pulls: [], stats: {} },
    new_player: { pulls: [], stats: {} } // Исправил ключ, чтобы совпадал с ID
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
                        // Восстанавливаем даты
                        Object.keys(parsed).forEach(key => {
                            if (parsed[key].pulls) {
                                parsed[key].pulls.forEach(p => p.time = new Date(p.time));
                            }
                            // Если вдруг старый формат кеша (без stats), пересчитаем
                            if (!parsed[key].stats) {
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
            await new Promise(r => setTimeout(r, 500)); // Небольшая задержка для UI

            return new Promise((resolve) => {
                update(currentData => {
                    // Глубокая копия
                    const newData = JSON.parse(JSON.stringify(currentData));
                    // Восстанавливаем даты после JSON.stringify
                    Object.keys(newData).forEach(k => {
                        if(newData[k].pulls) newData[k].pulls.forEach(p => p.time = new Date(p.time));
                    });

                    const report = { status: 'up_to_date', addedCount: {}, totalAdded: 0 };
                    
                    // Группируем входящие крутки
                    const incomingByBanner = {};
                    newPulls.forEach(p => {
                        // Мапим ID баннера из импорта на наши ключи стора
                        let bid = p.bannerId;
                        if (bid.includes('standard')) bid = 'standard';
                        else if (bid.includes('new')) bid = 'new_player';
                        else if (bid.includes('special')) bid = 'special'; // Упрощение, если у тебя один слот под спешл

                        // ВНИМАНИЕ: Если ты хранишь каждый спешл баннер отдельно (special_01, special_02), 
                        // то логика `bid` должна оставаться оригинальной p.bannerId. 
                        // Ниже я предполагаю, что ты хранишь ВСЕ спешлы в одной куче 'special', как в defaultData.
                        // Если нет - убери if/else выше.
                        
                        // Ладно, судя по defaultData у тебя ключи фиксированные. 
                        // Давай использовать маппинг, если bannerId сложный.
                        
                        if (!incomingByBanner[bid]) incomingByBanner[bid] = [];
                        incomingByBanner[bid].push(p);
                    });

                    let hasUpdates = false;

                    Object.keys(incomingByBanner).forEach(bid => {
                        // Создаем слот, если нет
                        if (!newData[bid]) newData[bid] = { pulls: [], stats: {} };

                        const oldList = newData[bid].pulls;
                        const incomeList = incomingByBanner[bid];

                        // Фильтруем дубликаты
                        const existingIds = new Set(oldList.map(p => p.id));
                        const reallyNew = incomeList.filter(p => !existingIds.has(p.id));

                        if (reallyNew.length > 0) {
                            // 1. Мержим
                            const mergedList = mergePulls(oldList, reallyNew);
                            
                            // 2. Считаем Pity для каждой крутки
                            const pullsWithPity = calculatePity(mergedList);
                            newData[bid].pulls = pullsWithPity;

                            // 3. СЧИТАЕМ ВСЮ СТАТИСТИКУ РАЗОМ
                            // Передаем bid, чтобы утилита знала, какой это тип баннера (для 50/50 и гаранта)
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