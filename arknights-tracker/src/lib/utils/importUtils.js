// src/lib/utils/importUtils.js
import { characters } from "$lib/data/characters";
import { weapons } from "$lib/data/weapons";
import { banners } from "$lib/data/banners";

const normalize = (str) => {
    if (!str || typeof str !== 'string') return "";
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
};

const sortPulls = (a, b) => {
    const timeDiff = a.time.getTime() - b.time.getTime();
    if (timeDiff !== 0) return timeDiff; 
    return (a.seqId || 0) - (b.seqId || 0);
};

export function getInternalBannerType(rawId) {
    if (!rawId) return 'standard';
    
    const id = String(rawId).toLowerCase().trim();
    if (
        id.includes('weapon') || 
        id.includes('wepon') || 
        id.includes('constant') || 
        id.includes('scathe')
    ) {
        return rawId;
    }
    if (id === '2' || id.includes('beginner') || id.includes('new') || id.includes('novice')) {
        return 'new-player';
    }
    if (id === '1' || id.includes('standard') || id.includes('permanent')) {
        return 'standard';
    }

    return 'special';
}

export function getWeaponCategory(bannerId) {
    if (!bannerId) return 'other';
    const id = String(bannerId).toLowerCase();

    if (id.includes('constant') || (id.includes('standard') && id.includes('weapon'))) {
        return 'weap-standard';
    }

    if (id.includes('wepon') || (id.includes('special') && id.includes('weapon'))) {
        return 'weap-special';
    }

    return 'other';
}

/**
 * ПАРСИНГ ЛОГОВ
 */
export function parseGachaLog(list) {
    if (!Array.isArray(list)) throw new Error("Invalid data: expected an array");
    if (list.length === 0) throw new Error("No data found");

    const parsedList = list.map((item, i) => {
        const rawName = item.name || item.charName || item.weaponName || item.character || item.item_name;
        
        const rarity = Number(item.rarity || item.rank || item.rank_type);
        const seqId = Number(item.seqId || item.sequence || 0);
        
        const isNew = item.isNew === true || item.isNew === "true" || item.is_new === true;

        let dateObj;
        if (item.gachaTs) dateObj = new Date(Number(item.gachaTs)); 
        else if (item.ts) dateObj = new Date(Number(item.ts) * 1000);
        else if (item.time) dateObj = new Date(item.time);
        else dateObj = new Date(0);
        
        const rawBannerId = item.bannerId || item.poolId || item.pool || item.gacha_type;

        if (!rawName) throw new Error(`Item #${i} has no name.`);
        if (!rarity || isNaN(rarity)) throw new Error(`Item #${i} has invalid rarity.`);

        const internalId = getInternalBannerType(rawBannerId);
        
        const itemType = item.weaponName ? 'weapon' : 'character';
        let uniqueId = item.id;
        if (!uniqueId) {
            if (seqId !== 0) {
                uniqueId = `${dateObj.getTime()}_${rawName}_${seqId}`;
            } else {
                uniqueId = `${dateObj.getTime()}_${rawName}_idx${i}`;
            }
        }

        return {
            id: uniqueId,
            time: dateObj,
            name: rawName,
            rarity: rarity,
            bannerId: internalId,
            seqId: seqId,
            isNew: isNew,
            type: itemType,
            rawPoolId: rawBannerId
        };
    });

    return parsedList.sort(sortPulls);
}

export function mergePulls(oldList, newList) {
    const map = new Map();
    oldList.forEach(p => map.set(p.id, p));
    newList.forEach(p => map.set(p.id, p));
    return Array.from(map.values()).sort(sortPulls);
}

export function calculatePity(pulls, bannerId) {
    const isSpecial = bannerId?.includes('special');
    let pityCounter = 0;
    
    return pulls.map((pull, index) => {
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
    
    const isWeapon = bannerId.includes('weap') || bannerId.includes('wepon');
    const isEventChar = bannerId.includes('special') && !isWeapon;
    const isStandardChar = bannerId === 'standard' || (bannerId.includes('standard') && !isWeapon);
    
    const hasGuaranteeSystem = isEventChar || isWeapon;

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
    
    let weaponGuaranteeCount = 0; 

    let validMileageTotal = 0;

    pulls.forEach((pull, index) => {
        const itemName = normalize(pull.name);
        const isFreePullIndex = (index >= 30 && index < 40);
        const isFreePull = isEventChar && isFreePullIndex;
        if (!isFreePull) {
            validMileageTotal++;
        }

        if (pull.rarity === 6) {
            count6++;
            sumPity6 += currentPity6 + (isFreePull ? 0 : 1); 

            const isFeatured = featured6.some(fid => {
                const c = characters[fid];
                if (c && normalize(c.name) === itemName) return true;
                const w = weapons[fid];
                if (w && normalize(w.name) === itemName) return true;
                return false;
            });

            if (last6WasFeatured) {
                total5050++;
                if (isFeatured) won5050++;
            }
            last6WasFeatured = isFeatured;
            currentPity6 = 0;

            if (isWeapon) {
                if (isFeatured) {
                    weaponGuaranteeCount = 0;
                    hasReceivedRateUp = true;
                } else {
                    if (!isFreePull && !hasReceivedRateUp) weaponGuaranteeCount++;
                }
            }

        } else {
            if (!isFreePull) {
                currentPity6++;
                
                if (isWeapon && !hasReceivedRateUp) {
                    weaponGuaranteeCount++;
                }
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

    let mileage = {
        show: false,
        current: 0,
        max: 0,
        label: ""
    };

    if (isStandardChar) {
        if (validMileageTotal < 300) {
            mileage = {
                show: true,
                current: validMileageTotal,
                max: 300,
                label: "selector_6"
            };
        }
    } 
    else if (isEventChar) {
        if (validMileageTotal < 120) {
            mileage = {
                show: true,
                current: validMileageTotal,
                max: 120,
                label: "guaranteed_6"
            };
        } 
        else {
            const cycle = 240;
            
            mileage = {
                show: true,
                current: validMileageTotal % cycle,
                max: cycle,
                label: "bonus_copy_6"
            };
        }
    }

    return {
        total,
        pity6: currentPity6,
        pity5: currentPity5,
        mileage,
        guarantee120: isWeapon ? weaponGuaranteeCount : 0, 
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

export function validateAccountConsistency(existingPulls, newPulls) {
    if (!existingPulls.length || !newPulls.length) return;

    const sortedNew = [...newPulls].sort((a, b) => a.time - b.time);
    const minNewTime = sortedNew[0].time.getTime();
    const maxNewTime = sortedNew[sortedNew.length - 1].time.getTime();

    const overlaps = existingPulls.filter(p => {
        const t = p.time.getTime();
        return t >= minNewTime && t <= maxNewTime;
    });

    if (overlaps.length === 0) return;

    const existingIdsInrange = new Set(overlaps.map(p => p.id));

    let hasMatch = false;
    for (const p of sortedNew) {
        if (existingIdsInrange.has(p.id)) {
            hasMatch = true;
            break;
        }
    }

    if (!hasMatch) {
        const startDate = new Date(minNewTime).toLocaleDateString();
        const endDate = new Date(maxNewTime).toLocaleDateString();
        throw new Error(
            `Account Mismatch! You already have history between ${startDate} and ${endDate}, but the imported data differs completely. Please check if you selected the correct account.`
        );
    }
}