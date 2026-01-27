import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { mergePulls, calculatePity, calculateBannerStats, validateAccountConsistency } from '$lib/utils/importUtils';
import { accountStore } from './accounts';
import { uploadLocalData, user } from "$lib/stores/cloudStore";

const defaultData = {
    "standard": { pulls: [], stats: {} },
    "special": { pulls: [], stats: {} },
    "new-player": { pulls: [], stats: {} }
};

function createPullStore() {
    // 1. Инициализируем стор дефолтными данными.
    // Это безопасно для сервера (SSR), так как мы не лезем в localStorage сразу.
    const { subscribe, set, update } = writable(JSON.parse(JSON.stringify(defaultData)));

    let currentAccountId = null;

    // === ХЕЛПЕРЫ ===

    const resetStore = () => {
        set(JSON.parse(JSON.stringify(defaultData)));
    };

    const restoreDatesAndStats = (data) => {
        if (!data || typeof data !== 'object') return;

        Object.keys(data).forEach(key => {
            if (data[key] && Array.isArray(data[key].pulls)) {
                data[key].pulls.forEach(p => {
                    if (p.time) p.time = new Date(p.time);
                });
                // Пересчитываем статы на лету, чтобы убедиться в их актуальности
                data[key].stats = calculateBannerStats(data[key].pulls, key);
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

    // === ОСНОВНАЯ ЛОГИКА ЗАГРУЗКИ ===

    const loadDataForAccount = (id) => {
        if (!browser) return; // СТРОГАЯ ЗАЩИТА ОТ SSR

        currentAccountId = id;
        const storageKey = `ark_tracker_data_${id}`;

        try {
            const stored = localStorage.getItem(storageKey);

            if (stored) {
                // Сценарий 1: Данные есть
                const parsed = JSON.parse(stored);
                restoreDatesAndStats(parsed);
                set(parsed);
            } else {
                // Сценарий 2: Данных нет, проверяем миграцию (legacy)
                const legacyData = localStorage.getItem('ark_tracker_pulls');

                if (legacyData && id === 'main') {
                    console.log("Migrating legacy data to Main account...");
                    const parsedLegacy = JSON.parse(legacyData);
                    restoreDatesAndStats(parsedLegacy);
                    set(parsedLegacy);

                    // Сохраняем в новый формат и чистим старый
                    saveDataToStorage(id, parsedLegacy);
                    localStorage.removeItem('ark_tracker_pulls');
                } else {
                    // Сценарий 3: Абсолютно новый аккаунт
                    resetStore();
                }
            }
        } catch (e) {
            console.error("Critical error loading account data:", e);
            resetStore();
        }
    };

    // === ПОДПИСКИ (ТОЛЬКО В БРАУЗЕРЕ) ===

    if (browser) {
        // Подписываемся на смену аккаунта
        accountStore.selectedId.subscribe(id => {
            if (id) loadDataForAccount(id);
        });

        // Слушаем событие полной очистки данных
        window.addEventListener('ark_tracker_clear_data', (e) => {
            if (e.detail && e.detail.id === currentAccountId) {
                resetStore();
            }
        });
    }

    // === PUBLIC API ===

    return {
        subscribe,
        set,    // Экспортируем set, если нужно вручную менять состояние (например из cloudStore)
        update, // Экспортируем update

        // Метод умного импорта
        smartImport: async (newPulls) => {
            if (!browser) return; // Защита

            // Искусственная задержка для UI
            await new Promise(r => setTimeout(r, 300));

            return new Promise((resolve, reject) => {
                update(currentData => {
                    try {
                        // Клонируем текущее состояние
                        const newData = JSON.parse(JSON.stringify(currentData));
                        restoreDatesAndStats(newData); // Восстанавливаем даты после JSON.stringify

                        const report = { status: 'up_to_date', addedCount: {}, totalAdded: 0 };

                        // 1. ВАЛИДАЦИЯ КОНСИСТЕНТНОСТИ
                        const allCurrentPulls = [
                            ...(newData.standard?.pulls || []),
                            ...(newData.special?.pulls || []),
                            ...(newData["new-player"]?.pulls || [])
                        ];

                        if (allCurrentPulls.length > 0) {
                            // Если валидация упадет, она выкинет throw, и мы попадем в catch
                            validateAccountConsistency(allCurrentPulls, newPulls);
                        }

                        // 2. Группировка входящих данных
                        const incomingByBanner = {};
                        newPulls.forEach(p => {
                            const bid = p.bannerId || 'standard';
                            if (!incomingByBanner[bid]) incomingByBanner[bid] = [];
                            incomingByBanner[bid].push(p);
                        });

                        let hasUpdates = false;

                        // 3. Обработка каждой группы
                        Object.keys(incomingByBanner).forEach(bid => {
                            // Определяем ключ (standard, special, new-player или кастомный event)
                            // Если баннера нет в структуре, кидаем в standard (или создаем новый ключ, если твоя логика это позволяет)
                            let targetKey = bid;

                            // Проверка: это известный ключ или оружие?
                            const isKnownKey = newData[bid] || bid === 'standard' || bid === 'special' || bid === 'new-player';
                            const isWeaponKey = bid.includes('weapon') || bid.includes('wepon') || bid.includes('constant');

                            if (!isKnownKey && !isWeaponKey) {
                                // Если это какой-то совсем левый ID (не оружие и не стандартный), 
                                // тогда ладно, кидаем в стандарт как fallback.
                                targetKey = 'standard';
                            }

                            if (!newData[targetKey]) {
                                newData[targetKey] = { pulls: [], stats: {} };
                            }

                            const oldList = newData[targetKey].pulls;
                            const incomeList = incomingByBanner[bid];

                            // Фильтруем дубликаты по ID
                            const existingIds = new Set(oldList.map(p => p.id));
                            const reallyNew = incomeList.filter(p => !existingIds.has(p.id));

                            if (reallyNew.length > 0) {
                                // Мержим
                                const mergedList = mergePulls(oldList, reallyNew);
                                // Пересчитываем Pity
                                const pullsWithPity = calculatePity(mergedList, targetKey);
                                // Обновляем список
                                newData[targetKey].pulls = pullsWithPity;
                                // Пересчитываем статистику
                                newData[targetKey].stats = calculateBannerStats(pullsWithPity, targetKey);

                                report.addedCount[targetKey] = (report.addedCount[targetKey] || 0) + reallyNew.length;
                                report.totalAdded += reallyNew.length;
                                hasUpdates = true;
                            }
                        });

                        // 4. Финализация
                        if (hasUpdates) {
                            report.status = 'updated';
                            saveDataToStorage(currentAccountId, newData);

                            // --- ДОБАВЬ ЭТУ СТРОКУ (Обновляем время локально) ---
                            if (browser) localStorage.setItem("ark_last_sync", Date.now().toString());
                            // ----------------------------------------------------

                            // Авто-синхронизация
                            if (get(user)) {
                                uploadLocalData();
                            }

                            resolve(report);
                            return newData;
                        } else {
                            resolve(report);
                            return currentData;
                        }

                    } catch (error) {
                        console.error("Smart Import Error:", error);
                        reject(error);
                        return currentData; // При ошибке не ломаем стор, возвращаем как было
                    }
                });
            });
        }
    };
}

export const pullData = createPullStore();