// src/lib/utils/importUtils.js
import { characters } from "$lib/data/characters";
import { banners } from "$lib/data/banners";

// Безопасная нормализация (защита от undefined)
const normalize = (str) => {
    if (!str || typeof str !== 'string') return "";
    return str.toLowerCase().replace(/\s+/g, "");
};

/**
 * Парсинг сырых логов
 */
export function parseGachaLog(list) {
    if (!Array.isArray(list)) return [];
    
    // Сортируем входящий список по времени, чтобы индексы были стабильными
    const sortedList = [...list].sort((a, b) => (a.ts || 0) - (b.ts || 0));

    return sortedList.map((item, i) => {
        // Защита от отсутствующего ID:
        // Используем timestamp + name + index, чтобы избежать дублей в одной десятке
        const uniqueId = item.id || `${item.ts}_${item.name}_${i}`;
        
        return {
            id: uniqueId,
            // Если time нет, конвертируем ts
            time: item.time ? new Date(item.time) : new Date((item.ts || 0) * 1000),
            name: item.name || "Unknown",
            rarity: Number(item.rarity) || 3, // Защита от NaN
            bannerId: item.bannerId || item.pool || item.gacha_type || "standard"
        };
    }).sort((a, b) => a.time - b.time);
}

/**
 * 1. Слияние списков
 */
export function mergePulls(oldList, newList) {
    const map = new Map();
    // oldList уже имеет правильные ID, сохраняем их
    oldList.forEach(p => map.set(p.id, p));
    // newList перезаписывает или добавляет новые
    newList.forEach(p => map.set(p.id, p));
    
    return Array.from(map.values()).sort((a, b) => new Date(a.time) - new Date(b.time));
}

/**
 * 2. Расчет Pity (визуальный для списков)
 */
export function calculatePity(pulls, bannerId) {
    // Определяем тип баннера для списка
    // (bannerId передается из стора, например 'special', 'standard')
    const isSpecial = bannerId?.includes('special');

    let pityCounter = 0;
    
    return pulls.map((pull, index) => {
        // Правило: 30-40 крутки бесплатные ТОЛЬКО на специальном баннере
        const isFreePull = isSpecial && (index >= 30 && index < 40);

        if (!isFreePull) {
            pityCounter++;
        }
        
        // Лега сбрасывает пити всегда
        if (pull.rarity === 6) {
            const resultPity = pityCounter;
            pityCounter = 0; 
            return { ...pull, pity: resultPity, isFree: isFreePull };
        }

        return { ...pull, pity: pityCounter, isFree: isFreePull };
    });
}

/**
 * 3. ГЛАВНАЯ ФУНКЦИЯ: Расчет статистики
 */
export function calculateBannerStats(pulls, bannerId) {
    // 1. Конфиг
    let bannerConfig = banners.find(b => b.id === bannerId);
    if (!bannerConfig) {
        if (bannerId.includes('standard')) bannerConfig = banners.find(b => b.type === 'standard');
        else if (bannerId.includes('special')) bannerConfig = banners.find(b => b.type === 'special');
        else if (bannerId.includes('new')) bannerConfig = banners.find(b => b.type === 'new-player');
    }

    const featured6 = bannerConfig?.featured6 || [];
    // Важно: проверяем именно конфиг, либо сам ID ключа стора
    const isSpecial = bannerConfig?.type === 'special' || bannerId.includes('special');

    // 2. Инициализация
    let total = pulls.length;
    let count6 = 0;
    let count5 = 0;
    let sumPity6 = 0;
    let sumPity5 = 0;

    let won5050 = 0;
    let total5050 = 0;
    let last6WasFeatured = true; 
    let hasReceivedRateUp = false;

    let currentPity6 = 0;
    let currentPity5 = 0;
    let guarantee120Counter = 0;

    // 3. Проход
    pulls.forEach((pull, index) => {
        const charName = normalize(pull.name);
        
        // [FIX] Бесплатные ТОЛЬКО для special
        const isFreePull = isSpecial && (index >= 30 && index < 40);

        // --- 6 ЗВЕЗД ---
        if (pull.rarity === 6) {
            count6++;
            sumPity6 += currentPity6 + (isFreePull ? 0 : 1); 

            // Featured check
            const isFeatured = featured6.some(fid => {
                const c = characters[fid];
                return c && normalize(c.name) === charName;
            });

            // 50/50
            if (last6WasFeatured) {
                total5050++;
                if (isFeatured) won5050++;
            }
            last6WasFeatured = isFeatured;

            currentPity6 = 0; // Сброс обычного пити

            // 120 Guarantee Logic
            if (isSpecial) {
                if (isFeatured) {
                    guarantee120Counter = 0;
                    hasReceivedRateUp = true;
                } else {
                    if (!isFreePull && !hasReceivedRateUp) {
                        guarantee120Counter++;
                    }
                }
            }
        } 
        else {
            // Не лега
            if (!isFreePull) {
                currentPity6++;
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