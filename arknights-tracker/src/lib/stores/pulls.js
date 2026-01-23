import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { mergePulls, calculatePity, calculateBannerStats, validateAccountConsistency } from '$lib/utils/importUtils';
import { accountStore } from './accounts';

const defaultData = {
    "standard": { pulls: [], stats: {} },
    "special": { pulls: [], stats: {} },
    "new-player": { pulls: [], stats: {} }
};

function createPullStore() {
    // Внутренний writable, который хранит текущие данные
    const store = writable(JSON.parse(JSON.stringify(defaultData)));
    
    let currentAccountId = null;

    // Функция загрузки данных для конкретного ID
    const loadDataForAccount = (id) => {
        if (!browser) return;
        currentAccountId = id;

        // 1. Формируем ключ для конкретного аккаунта
        const storageKey = `ark_tracker_data_${id}`;
        const stored = localStorage.getItem(storageKey);

        if (stored) {
            // Если данные есть — грузим и парсим даты
            try {
                const parsed = JSON.parse(stored);
                restoreDatesAndStats(parsed);
                store.set(parsed);
            } catch (e) {
                console.error("Data load error", e);
                store.set(JSON.parse(JSON.stringify(defaultData)));
            }
        } else {
            // 2. МИГРАЦИЯ: Если данных нет, проверяем, не "старый" ли это пользователь
            // Проверяем старый ключ без ID
            const legacyData = localStorage.getItem('ark_tracker_pulls');
            
            // Если есть старые данные И мы сейчас грузим 'main' (первый акк)
            if (legacyData && id === 'main') {
                console.log("Migrating legacy data to Main account...");
                try {
                    const parsed = JSON.parse(legacyData);
                    restoreDatesAndStats(parsed);
                    store.set(parsed);
                    
                    // Сохраняем в новый формат
                    saveData(id, parsed);
                    // Удаляем старый ключ, чтобы не мигрировать вечно
                    localStorage.removeItem('ark_tracker_pulls');
                } catch (e) {
                    store.set(JSON.parse(JSON.stringify(defaultData)));
                }
            } else {
                // Чистый новый аккаунт
                store.set(JSON.parse(JSON.stringify(defaultData)));
            }
        }
    };

    // Хелпер для восстановления объектов Date
    const restoreDatesAndStats = (data) => {
        Object.keys(data).forEach(key => {
            if (data[key].pulls) {
                data[key].pulls.forEach(p => p.time = new Date(p.time));
                // Пересчитываем статы на всякий случай
                data[key].stats = calculateBannerStats(data[key].pulls, key);
            }
        });
    };

    // Хелпер сохранения
    const saveData = (id, data) => {
        if (browser && id) {
            localStorage.setItem(`ark_tracker_data_${id}`, JSON.stringify(data));
        }
    };

    // --- ПОДПИСКА НА СМЕНУ АККАУНТА ---
    if (browser) {
        accountStore.selectedId.subscribe(id => {
            if (id) loadDataForAccount(id);
        });
        
        // Слушаем событие очистки (из accountStore)
        window.addEventListener('ark_tracker_clear_data', (e) => {
             if (e.detail.id === currentAccountId) {
                 store.set(JSON.parse(JSON.stringify(defaultData)));
             }
        });
    }

    return {
        subscribe: store.subscribe,

        // Основной метод импорта
        smartImport: async (newPulls) => {
            // Искусственная задержка для UI
            await new Promise(r => setTimeout(r, 300));

            return new Promise((resolve, reject) => {
                store.update(currentData => {
                    const newData = JSON.parse(JSON.stringify(currentData));
                    // Восстанавливаем даты после клонирования
                    restoreDatesAndStats(newData);

                    const report = { status: 'up_to_date', addedCount: {}, totalAdded: 0 };
                    
                    try {
                        // === ВАЛИДАЦИЯ АККАУНТА (НОВАЯ ЛОГИКА) ===
                        // Собираем все текущие крутки в одну кучу для проверки
                        const allCurrentPulls = [
                            ...newData.standard.pulls, 
                            ...newData.special.pulls, 
                            ...newData["new-player"].pulls
                        ];

                        // Если это не пустой аккаунт, проверяем на конфликты
                        if (allCurrentPulls.length > 0) {
                            validateAccountConsistency(allCurrentPulls, newPulls);
                        }
                        // ==========================================

                        // Группировка новых по баннерам
                        const incomingByBanner = {};
                        newPulls.forEach(p => {
                            const bid = p.bannerId; 
                            if (!incomingByBanner[bid]) incomingByBanner[bid] = [];
                            incomingByBanner[bid].push(p);
                        });

                        let hasUpdates = false;

                        Object.keys(incomingByBanner).forEach(bid => {
                            const targetKey = newData[bid] ? bid : 'standard';
                            
                            // Защита структуры
                            if (!newData[targetKey]) newData[targetKey] = { pulls: [], stats: {} };

                            const oldList = newData[targetKey].pulls;
                            const incomeList = incomingByBanner[bid];
                            
                            // Фильтр дублей
                            const existingIds = new Set(oldList.map(p => p.id));
                            const reallyNew = incomeList.filter(p => !existingIds.has(p.id));

                            if (reallyNew.length > 0) {
                                // 1. Мерж
                                const mergedList = mergePulls(oldList, reallyNew);
                                
                                // 2. Pity
                                const pullsWithPity = calculatePity(mergedList, targetKey);
                                newData[targetKey].pulls = pullsWithPity;

                                // 3. Stats
                                newData[targetKey].stats = calculateBannerStats(pullsWithPity, targetKey);

                                report.addedCount[targetKey] = (report.addedCount[targetKey] || 0) + reallyNew.length;
                                report.totalAdded += reallyNew.length;
                                hasUpdates = true;
                            }
                        });

                        if (hasUpdates) {
                            report.status = 'updated';
                            // Сохраняем под текущий ID
                            saveData(currentAccountId, newData);
                        }

                        resolve(report);
                        return newData;

                    } catch (error) {
                        // Если валидация не прошла
                        reject(error);
                        return currentData; // Возвращаем старые данные без изменений
                    }
                });
            });
        }
    };
}

export const pullData = createPullStore();