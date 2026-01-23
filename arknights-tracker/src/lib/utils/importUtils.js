// src/lib/utils/importUtils.js
import { characters } from "$lib/data/characters";
import { banners } from "$lib/data/banners";

const normalize = (str) => {
    if (!str || typeof str !== 'string') return "";
    return str.toLowerCase().replace(/\s+/g, "");
};

export function getInternalBannerType(rawId) {
    if (rawId === undefined || rawId === null) return 'standard';
    const id = String(rawId).toLowerCase().trim();

    // 1. Новичок
    if (id === '2' || id.includes('new') || id.includes('beginner') || id.includes('novice')) {
        return 'new-player';
    }
    // 2. Стандарт
    if (id === '1' || id.includes('standard') || id.includes('permanent')) {
        return 'standard';
    }
    // 3. Спешл
    return 'special';
}

export function parseGachaLog(list) {
    if (!Array.isArray(list)) return [];
    
    // Сортировка
    const sortedList = [...list].sort((a, b) => (a.ts || 0) - (b.ts || 0));

    return sortedList.map((item, i) => {
        // === ОТЛАДКА: ВЫВОДИМ ПОЛНЫЙ ОБЪЕКТ ПЕРВОЙ КРУТКИ ===
        if (i === 0) {
            console.log("🔥 FULL ITEM DATA:", JSON.stringify(item, null, 2));
        }
        // =====================================================

        // Попытка найти ID баннера (добавил poolId и gachaId на всякий случай)
        const rawBannerId = item.bannerId || item.pool || item.gacha_type || item.poolId || item.gachaId;
        const internalId = getInternalBannerType(rawBannerId);

        // Попытка найти Имя (добавил item_name)
        const rawName = item.name || item.character || item.chars || item.item_name || "Unknown";
        
        // Попытка найти Редкость (добавил rank_type)
        const rarity = Number(item.rarity || item.rank || item.rank_type || 3);
        
        const uniqueId = item.id || `${item.ts}_${rawName}_${i}`;
        
        return {
            id: uniqueId,
            time: item.time ? new Date(item.time) : new Date((item.ts || 0) * 1000),
            name: rawName,
            rarity: isNaN(rarity) ? 3 : rarity,
            bannerId: internalId 
        };
    }).sort((a, b) => a.time - b.time);
}

// ... ОСТАЛЬНЫЕ ФУНКЦИИ (ОСТАВЛЯЕМ КАК БЫЛИ) ...

export function mergePulls(oldList, newList) {
    const map = new Map();
    oldList.forEach(p => map.set(p.id, p));
    newList.forEach(p => map.set(p.id, p));
    return Array.from(map.values()).sort((a, b) => new Date(a.time) - new Date(b.time));
}

export function calculatePity(pulls, bannerId) {
    // ВАЖНО: bannerId здесь уже должен быть 'special', 'standard' или 'new-player'
    const isSpecial = bannerId?.includes('special');
    let pityCounter = 0;
    
    return pulls.map((pull, index) => {
        // Правило 30-40 работает только для Special
        const isFreePull = isSpecial && (index >= 30 && index < 40);

        if (!isFreePull) pityCounter++;
        
        if (pull.rarity === 6) {
            const resultPity = pityCounter;
            pityCounter = 0; 
            return { ...pull, pity: resultPity, isFree: isFreePull };
        }

        return { ...pull, pity: pityCounter, isFree: isFreePull };
    });
}

export function calculateBannerStats(pulls, bannerId) {
    let bannerConfig = banners.find(b => b.id === bannerId);
    if (!bannerConfig) {
         if (bannerId.includes('new')) bannerConfig = banners.find(b => b.type === 'new-player');
         else if (bannerId.includes('special')) bannerConfig = banners.find(b => b.type === 'special');
         else bannerConfig = banners.find(b => b.type === 'standard');
    }

    const featured6 = bannerConfig?.featured6 || [];
    // Строгая проверка типа для логики гарантов
    const isSpecial = bannerId.includes('special');

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
    let guarantee120 = 0; 

    pulls.forEach((pull, index) => {
        const charName = normalize(pull.name);
        // Правило 30-40
        const isFreePull = isSpecial && (index >= 30 && index < 40);

        if (pull.rarity === 6) {
            count6++;
            sumPity6 += currentPity6 + (isFreePull ? 0 : 1); 

            const isFeatured = featured6.some(fid => {
                const c = characters[fid];
                return c && normalize(c.name) === charName;
            });

            if (last6WasFeatured) {
                total5050++;
                if (isFeatured) won5050++;
            }
            last6WasFeatured = isFeatured;
            currentPity6 = 0;

            if (isSpecial) {
                if (isFeatured) {
                    guarantee120 = 0;
                    hasReceivedRateUp = true;
                } else {
                    if (!isFreePull && !hasReceivedRateUp) guarantee120++;
                }
            }
        } else {
            if (!isFreePull) {
                currentPity6++;
                if (isSpecial && !hasReceivedRateUp) guarantee120++;
            }
        }

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
        guarantee120: isSpecial && !hasReceivedRateUp ? guarantee120 : 0,
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