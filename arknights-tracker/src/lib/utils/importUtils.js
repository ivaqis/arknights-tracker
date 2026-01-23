// src/lib/utils/importUtils.js
import { characters } from "$lib/data/characters";
import { banners } from "$lib/data/banners";

// Нормализация имени (убираем пробелы, lowercase)
const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "") || "";

/**
 * Парсинг сырых логов (Восстановленная функция)
 * Преобразует данные от API в удобный формат
 */
export function parseGachaLog(list) {
    if (!Array.isArray(list)) return [];
    
    return list.map(item => {
        return {
            // Генерируем ID, если его нет (timestamp + name)
            id: item.id || `${item.ts}_${item.name}`,
            // Преобразуем timestamp (секунды) в Date, если нужно
            time: item.time ? new Date(item.time) : new Date(item.ts * 1000),
            name: item.name,
            rarity: parseInt(item.rarity),
            // Маппинг полей пула, если API отдает gacha_type или pool
            bannerId: item.bannerId || item.pool || item.gacha_type || "standard"
        };
    }).sort((a, b) => a.time - b.time);
}

/**
 * 1. Слияние списков (старых и новых круток)
 */
export function mergePulls(oldList, newList) {
    const map = new Map();
    // Используем Map по ID, чтобы убрать дубликаты
    oldList.forEach(p => map.set(p.id, p));
    newList.forEach(p => map.set(p.id, p));
    // Возвращаем отсортированный массив
    return Array.from(map.values()).sort((a, b) => new Date(a.time) - new Date(b.time));
}

/**
 * 2. Расчет Pity для списка (визуальный)
 * Учитывает правило: 30-40 крутки бесплатные и не увеличивают счетчик
 */
export function calculatePity(pulls) {
    let pityCounter = 0;
    return pulls.map((pull, index) => {
        // Бесплатные крутки (с 31 по 40 включительно)
        // Индексы идут с 0, поэтому проверяем 30..39
        const isFreePull = index >= 30 && index < 40;

        if (!isFreePull) {
            pityCounter++;
        }
        
        // Если выпала лега, пити сбрасывается ВСЕГДА (даже на бесплатной)
        if (pull.rarity === 6) {
            const resultPity = pityCounter;
            pityCounter = 0; 
            return { ...pull, pity: resultPity, isFree: isFreePull };
        }

        return { ...pull, pity: pityCounter, isFree: isFreePull };
    });
}

/**
 * 3. ГЛАВНАЯ ФУНКЦИЯ: Расчет всей статистики баннера
 */
export function calculateBannerStats(pulls, bannerId) {
    // 1. Определяем конфигурацию баннера
    let bannerConfig = banners.find(b => b.id === bannerId);
    if (!bannerConfig) {
        if (bannerId.includes('standard')) bannerConfig = banners.find(b => b.type === 'standard');
        if (bannerId.includes('special')) bannerConfig = banners.find(b => b.type === 'special');
        if (bannerId.includes('new')) bannerConfig = banners.find(b => b.type === 'new-player');
    }

    const featured6 = bannerConfig?.featured6 || [];
    const isSpecial = bannerConfig?.type === 'special';

    // 2. Инициализация переменных
    let total = pulls.length;
    let count6 = 0;
    let count5 = 0;
    let sumPity6 = 0;
    let sumPity5 = 0;

    // 50/50 и Rate Up
    let won5050 = 0;
    let total5050 = 0;
    let last6WasFeatured = true; 
    let hasReceivedRateUp = false; // Получили ли мы уже ивентового перса

    // Текущие счетчики
    let currentPity6 = 0;
    let currentPity5 = 0;
    let guarantee120Counter = 0; // Счетчик до 120 (для первого Rate Up)

    // 3. Линейный проход по истории
    pulls.forEach((pull, index) => {
        const charName = normalize(pull.name);
        
        // Проверка на бесплатную десятку (индексы 30-39)
        const isFreePull = index >= 30 && index < 40;

        // --- 6 ЗВЕЗД ---
        if (pull.rarity === 6) {
            count6++;
            
            // Запоминаем пити (учитывая, что на бесплатной оно не росло, но сбросилось)
            sumPity6 += currentPity6 + (isFreePull ? 0 : 1); 

            // Это Rate-Up персонаж?
            const isFeatured = featured6.some(fid => {
                const c = characters[fid];
                return c && normalize(c.name) === charName;
            });

            // Статистика 50/50
            if (last6WasFeatured) {
                total5050++;
                if (isFeatured) won5050++;
            }
            last6WasFeatured = isFeatured;

            // Сброс обычного пити (до 80)
            currentPity6 = 0;

            // Логика Гаранта 120 (First Rate Up Guarantee)
            if (isSpecial) {
                if (isFeatured) {
                    // Если выпал ивентовый - гарант 120 выполнен/сброшен
                    guarantee120Counter = 0;
                    hasReceivedRateUp = true;
                } else {
                    // Если выпал стандартный - счетчик 120 ПРОДОЛЖАЕТ тикать
                    if (!isFreePull && !hasReceivedRateUp) {
                        guarantee120Counter++;
                    }
                }
            }
        } 
        else {
            // Не лега (3*, 4*, 5*)
            if (!isFreePull) {
                currentPity6++;
                
                // Счетчик 120 тикает, пока мы не получили первого Rate Up
                if (isSpecial && !hasReceivedRateUp) {
                    guarantee120Counter++;
                }
            }
        }

        // --- 5 ЗВЕЗД ---
        if (pull.rarity === 5) {
            count5++;
            sumPity5 += currentPity5 + (isFreePull ? 0 : 1);
            currentPity5 = 0;
        } else {
            if (!isFreePull) currentPity5++;
        }
    });

    return {
        total,
        pity6: currentPity6,
        pity5: currentPity5,
        
        // Гарант 120
        guarantee120: isSpecial && !hasReceivedRateUp ? guarantee120Counter : 0,
        hasReceivedRateUp,
        
        count6,
        count5,
        avg6: count6 ? (sumPity6 / count6).toFixed(1) : "0.0",
        avg5: count5 ? (sumPity5 / count5).toFixed(1) : "0.0",
        
        percent6: total ? ((count6 / total) * 100).toFixed(2) : "0.00",
        percent5: total ? ((count5 / total) * 100).toFixed(2) : "0.00",

        winRate: {
            won: won5050,
            total: total5050,
            percent: total5050 ? ((won5050 / total5050) * 100).toFixed(0) : 0
        }
    };
}