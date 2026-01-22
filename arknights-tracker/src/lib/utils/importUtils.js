// src/lib/utils/importUtils.js
import { banners } from '$lib/data/banners';
import { characters } from '$lib/data/characters';
import { bannerTypes } from '$lib/data/bannerTypes';

// Pool types mapping for Arknights Endfield
const POOL_TYPES = {
    beginner: "E_CharacterGachaPoolType_Beginner",
    standard: "E_CharacterGachaPoolType_Standard",
    special: "E_CharacterGachaPoolType_Special"
};

// Internal banner ID mapping
const GACHA_TYPE_MAP = bannerTypes.reduce((acc, banner) => {
    if (banner.apiType) {
        acc[banner.apiType] = banner.id;
    }
    return acc;
}, {});

/**
 * Transforms API item to internal pull format
 */
export function parseGachaLog(rawList) {
    if (!Array.isArray(rawList)) return [];

    return rawList.map(item => {
        // Map API poolId (e.g., 'beginner') to Internal ID (e.g., 'new-player')
        const bannerId = GACHA_TYPE_MAP[item.poolId] || "unknown";
        
        return {
            id: item.seqId,
            bannerId: bannerId,
            // Backend sends 'gachaTs' as string string timestamp
            time: new Date(parseInt(item.gachaTs)), 
            name: item.charName,
            rarity: parseInt(item.rarity) || 3,
            type: "Character",
            gachaType: item.poolId, // 'beginner', 'standard', 'special'
            icon: ""
        };
    });
}

/**
 * Fetches all pages for all pools using the provided base URL
 */
export async function fetchAllEndfieldData(baseUrl) {
    const urlObj = new URL(baseUrl);
    let allPulls = [];

    // Iterate through all banner types
    for (const [key, poolName] of Object.entries(POOL_TYPES)) {
        let hasMore = true;
        let lastId = "";

        while (hasMore) {
            urlObj.searchParams.set('pool_type', poolName);
            if (lastId) urlObj.searchParams.set('last_id', lastId);

            // Using fetch to get data from Gryphline API
            const response = await fetch(urlObj.toString());
            const result = await response.json();

            if (result.code !== 0) break;

            const list = result.data.list || [];
            allPulls = [...allPulls, ...list];
            hasMore = result.data.hasMore;

            if (list.length > 0) {
                lastId = list[list.length - 1].seqId;
            } else {
                hasMore = false;
            }
        }
    }
    return allPulls;
}

export function mergePulls(currentPulls, newPulls) {
    const existingIds = new Set(currentPulls.map(p => p.id));
    const uniqueNew = newPulls.filter(p => !existingIds.has(p.id));
    return [...currentPulls, ...uniqueNew].sort((a, b) => a.time - b.time || a.id - b.id);
}

// Хелпер для парсинга дат баннеров как UTC, если указано
function parseBannerDate(dateStr, timezone) {
    if (!dateStr) return null;
    // Если таймзона UTC+0 и в строке нет Z или смещения, добавляем Z для корректного парсинга
    if (timezone === "UTC+0" && !dateStr.includes("Z") && !dateStr.includes("+")) {
        return new Date(dateStr.replace(" ", "T") + "Z");
    }
    return new Date(dateStr);
}

function getCharIdByName(name) {
    const entry = Object.values(characters).find(c => c.name.toLowerCase() === name.toLowerCase());
    return entry ? entry.id : null;
}

export function calculatePity(pulls, bannerType) {
    if (!pulls || pulls.length === 0) return [];

    let pity6 = 0;
    let pity5 = 0;
    let isGuaranteed6 = false;
    let isGuaranteed5 = false;

    return pulls.map(pull => {
        pity6++;
        pity5++;

        let currentPity = 1;
        let status = 'normal'; // 'won', 'lost', 'guaranteed', 'normal', 'unknown'
        
        const pullDate = new Date(pull.time);

        // Ищем активный баннер
        const activeBanner = banners.find(b => {
            if (b.type !== bannerType) return false;
            
            const start = parseBannerDate(b.startTime, b.timezone);
            const end = parseBannerDate(b.endTime, b.timezone);

            return pullDate >= start && (end === null || pullDate <= end);
        });

        // Отладка в консоль, если статус unknown для леги
        if (pull.rarity === 6 && !activeBanner) {
            console.warn("Banner not found for pull:", {
                pullDate: pullDate.toISOString(),
                char: pull.name,
                type: bannerType
            });
        }

        if (pull.rarity === 6) {
            currentPity = pity6;
            pity6 = 0;

            if (activeBanner && activeBanner.featured6) {
                const pullCharId = getCharIdByName(pull.name); 
                // Приводим к нижнему регистру для надежности
                const featured = activeBanner.featured6.map(n => n.toLowerCase());
                const pullName = pull.name.toLowerCase();
                const isFeatured = pullCharId && activeBanner.featured6.includes(pullCharId);

                if (isFeatured) {
                    status = isGuaranteed6 ? 'guaranteed' : 'won';
                    isGuaranteed6 = false;
                } else {
                    status = 'lost';
                    isGuaranteed6 = true;
                }
            } else {
                // Если баннер не найден или это стандартный баннер без ап-рейта конкретного
                // Для стандарта (standard) можно считать всегда won или normal
                status = (bannerType === 'standard') ? 'won' : 'unknown';
            }
        } 
        else if (pull.rarity === 5) {
            currentPity = pity5;
            pity5 = 0;

            if (activeBanner && activeBanner.featured5) {
                const featured = activeBanner.featured5.map(n => n.toLowerCase());
                const pullName = pull.name.toLowerCase();
                const isFeatured = featured.includes(pullName);

                if (isFeatured) {
                    status = isGuaranteed5 ? 'guaranteed' : 'won';
                    isGuaranteed5 = false;
                } else {
                    status = 'lost';
                    isGuaranteed5 = true;
                }
            } else {
                status = 'normal';
            }
        } 
        else {
            currentPity = 1;
            status = 'normal';
        }

        return {
            ...pull,
            pity: currentPity,
            status: status,
            bannerImage: activeBanner ? activeBanner.icon : null 
        };
    });
}
