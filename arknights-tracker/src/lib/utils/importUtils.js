// src/lib/utils/importUtils.js

import { get } from 'svelte/store';
import { t } from '$lib/i18n';
import { characters } from "$lib/data/characters";
import { weapons } from "$lib/data/weapons";
import { banners } from "$lib/data/banners";

const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";

const sortPulls = (a, b) => {
    const timeDiff = a.time.getTime() - b.time.getTime();
    if (timeDiff !== 0) return timeDiff; 
    return (a.seqId || 0) - (b.seqId || 0);
};

function getServerOffset(specificServerId) {
    let sid = specificServerId;

    if (!sid && typeof window !== 'undefined') {
        sid = localStorage.getItem("ark_server_id");
    }
    if (String(sid) === "2") return 8; 
    
    return -5; 
}

function parseDateWithServer(dateStr, serverId) {
    if (!dateStr) return null;
    
    const offset = getServerOffset(serverId);
    
    const sign = offset >= 0 ? "+" : "-";
    const pad = (n) => String(Math.abs(n)).padStart(2, '0');
    const isoStr = dateStr.replace(" ", "T") + `${sign}${pad(offset)}:00`;
    return new Date(isoStr);
}

function findBannerConfigByTime(timestamp, categoryContext, serverId) {
    const time = new Date(timestamp).getTime();
    const BUFFER = 4 * 60 * 60 * 1000; 

    let targetType = null;
    if (categoryContext) {
        if (categoryContext.includes('weap') || categoryContext.includes('constant')) targetType = 'weapon';
        else if (categoryContext.includes('new')) targetType = 'new-player';
        else if (categoryContext === 'standard') targetType = 'standard';
        else if (categoryContext === 'special') targetType = 'special';
    }

    const candidates = banners.filter(b => {
        const start = parseDateWithServer(b.startTime, serverId).getTime();
        const end = b.endTime ? parseDateWithServer(b.endTime, serverId).getTime() : Infinity;
        
        if (time < (start - BUFFER) || time > (end + BUFFER)) return false;

        if (targetType) {
            if (targetType === 'special' && b.type !== 'special') return false;
            if (targetType === 'standard' && b.type !== 'standard') return false;
            if (targetType === 'new-player' && b.type !== 'new-player') return false;
            if (targetType === 'weapon' && b.type !== 'weapon' && !b.id.includes('weap')) return false;
        } else {
            const isBannerWeapon = b.type === 'weapon' || (b.id && b.id.includes('weap'));
            if (b.type === 'new-player') return false;
            if (isBannerWeapon) return false;
        }
        return true;
    });

    if (candidates.length > 0) {
        candidates.sort((a, b) => 
            parseDateWithServer(b.startTime, serverId).getTime() - 
            parseDateWithServer(a.startTime, serverId).getTime()
        );
        return candidates[0];
    }

    return undefined;
}

function getDistinctBannerId(pull, serverId) {
    const rawId = pull.rawPoolId || pull.bannerId || 'unknown';
    const genericIds = ['special', 'standard', 'weapon', 'weap-special', 'weap-standard', 'new-player'];

    if (!genericIds.includes(rawId)) return rawId;

    const foundBanner = findBannerConfigByTime(pull.time, rawId, serverId);
    if (foundBanner) return foundBanner.id;

    const d = new Date(pull.time);
    return `gen_${rawId}_${d.getFullYear()}_${d.getMonth()}_w${Math.floor(d.getDate()/7)}`; 
}

export function getInternalBannerType(rawId) {
    if (!rawId) return 'standard';
    const id = String(rawId).toLowerCase().trim();
    if (id.includes('weapon') || id.includes('wepon') || id.includes('constant') || id.includes('scathe')) return rawId;
    if (id === '2' || id.includes('beginner') || id.includes('new') || id.includes('novice')) return 'new-player';
    if (id === '1' || id.includes('standard') || id.includes('permanent')) return 'standard';
    return 'special';
}

export function getWeaponCategory(bannerId) {
    if (!bannerId) return 'other';
    const id = String(bannerId).toLowerCase();
    if (id.includes('constant') || (id.includes('standard') && id.includes('weapon'))) return 'weap-standard';
    if (id.includes('wepon') || (id.includes('special') && id.includes('weapon'))) return 'weap-special';
    return 'other';
}

export function parseGachaLog(list) {
    if (!Array.isArray(list)) throw new Error("Invalid data array");
    return list.map((item, i) => {
        const rawName = item.name || item.charName || item.weaponName || item.character || item.item_name;
        const rarity = Number(item.rarity || item.rank || item.rank_type);
        const seqId = Number(item.seqId || item.sequence || 0);
        const isNew = item.isNew === true || String(item.isNew) === "true" || item.is_new === true;
        const isFree = item.isFree === true || String(item.isFree) === "true";
        let dateObj;
        if (item.gachaTs) dateObj = new Date(Number(item.gachaTs)); 
        else if (item.ts) dateObj = new Date(Number(item.ts) * 1000);
        else if (item.time) dateObj = new Date(item.time);
        else dateObj = new Date(0);
        
        const rawBannerId = item.bannerId || item.poolId || item.pool || item.gacha_type;
        const internalId = getInternalBannerType(rawBannerId);
        const itemType = item.weaponName ? 'weapon' : 'character';
        let uniqueId = item.id || (seqId !== 0 ? `${dateObj.getTime()}_${rawName}_${seqId}` : `${dateObj.getTime()}_${rawName}_idx${i}`);
        return { id: uniqueId, time: dateObj, name: rawName, rarity, bannerId: internalId, seqId, isNew, isFree, type: itemType, rawPoolId: rawBannerId };
    }).sort(sortPulls);
}

export function mergePulls(oldList, newList) {
    const map = new Map();
    oldList.forEach(p => map.set(p.id, p));
    newList.forEach(p => map.set(p.id, p));
    return Array.from(map.values()).sort(sortPulls);
}

export function calculatePity(pulls, bannerId, accountServerId = null) {
    const isSpecialCategory = bannerId?.includes('special') && !bannerId.includes('weap');
    let pityCounter = 0;
    const bannerSpecificCounts = {}; 

    return pulls.map((pull) => {
        const uniqueBannerKey = getDistinctBannerId(pull, accountServerId);
        if (!bannerSpecificCounts[uniqueBannerKey]) bannerSpecificCounts[uniqueBannerKey] = 0;
        
        let isFreePull = false;
        if (typeof pull.isFree === 'boolean') {
            isFreePull = pull.isFree;
        } else {
            const countInThisBanner = bannerSpecificCounts[uniqueBannerKey];
            isFreePull = isSpecialCategory && (countInThisBanner >= 30 && countInThisBanner < 40);
        }

        bannerSpecificCounts[uniqueBannerKey]++;

        if (!isFreePull) {
            pityCounter++;
        }
        
        if (pull.rarity === 6) {
            const currentPityValue = isFreePull ? 1 : pityCounter;
            if (!isFreePull) pityCounter = 0;
            return { ...pull, pity: currentPityValue, isFree: isFreePull };
        }
        return { ...pull, pity: isFreePull ? 1 : pityCounter, isFree: isFreePull };
    });
}

export function calculateBannerStats(pulls, bannerId, accountServerId = null) {
    pulls.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    let currentViewBanner = banners.find(b => b.id === bannerId);
    const isWeaponType = bannerId.includes('weap') || bannerId.includes('wepon') || bannerId.includes('constant');

    if (!currentViewBanner && (bannerId.includes('special') || isWeaponType)) {
        const candidates = banners.filter(b => {
            if (isWeaponType) return b.type === 'weapon' || (b.id && (b.id.includes('weap') || b.id.includes('wepon')));
            return b.type === 'special';
        });
        
        candidates.sort((a, b) => 
            parseDateWithServer(b.startTime, accountServerId).getTime() - 
            parseDateWithServer(a.startTime, accountServerId).getTime()
        );
        
        const lastPullTime = pulls.length > 0 ? pulls[pulls.length - 1].time.getTime() : Date.now();
        const activeBanner = candidates.find(b => 
            parseDateWithServer(b.startTime, accountServerId).getTime() <= lastPullTime
        );
        
        if (activeBanner) currentViewBanner = activeBanner;
        else if (candidates.length > 0) currentViewBanner = candidates[0];
    }

    let mileageStart = 0;
    let mileageEnd = 0;
    if (currentViewBanner) {
        mileageStart = parseDateWithServer(currentViewBanner.startTime, accountServerId).getTime();
        mileageEnd = currentViewBanner.endTime ? parseDateWithServer(currentViewBanner.endTime, accountServerId).getTime() : Infinity;
    }

    const hardPityLimit = isWeaponType ? 80 : 120;
    let total = pulls.length;
    let count6 = 0, count5 = 0;
    let sumPity6 = 0, sumPity5 = 0;
    let won5050 = 0, total5050 = 0;
    let hasReceivedRateUp = false;
    let currentPity6 = 0, currentPity5 = 0;
    let rateUpCounter = 0; 
    let currentBannerMileage = 0; 

    const bannerSpecificCounts = {};

    pulls.forEach((pull) => {
        const itemName = normalize(pull.name);
        const pullTime = new Date(pull.time).getTime();
        const uniqueBannerKey = getDistinctBannerId(pull, accountServerId);

        if (!bannerSpecificCounts[uniqueBannerKey]) bannerSpecificCounts[uniqueBannerKey] = 0;

        let isFreePull = false;
        if (typeof pull.isFree === 'boolean') {
            isFreePull = pull.isFree;
        } else {
            const countInThisBanner = bannerSpecificCounts[uniqueBannerKey];
            isFreePull = (bannerId.includes('special') && !isWeaponType) && (countInThisBanner >= 30 && countInThisBanner < 40);
        }

        bannerSpecificCounts[uniqueBannerKey]++;

        if (isFreePull) {
            return; 
        }

        let isHardPityTriggered = false;
        if (rateUpCounter >= hardPityLimit - 1) isHardPityTriggered = true;
        rateUpCounter++;

        if (bannerId.includes('standard') || bannerId.includes('new')) {
            currentBannerMileage++;
        } else if (pullTime >= mileageStart && pullTime <= mileageEnd) {
            currentBannerMileage++;
        }

        if (pull.rarity === 6) {
            count6++;
            sumPity6 += currentPity6 + 1;
            
            let historicConfig = banners.find(b => b.id === uniqueBannerKey);
            if (!historicConfig) historicConfig = findBannerConfigByTime(pull.time, pull.rawPoolId, accountServerId);
            const featuredList = historicConfig?.featured6 || currentViewBanner?.featured6 || [];

            const isFeatured = featuredList.some(fid => {
                const c = characters[fid]; if (c && normalize(c.name) === itemName) return true;
                const w = weapons[fid]; if (w && normalize(w.name) === itemName) return true;
                return normalize(fid) === itemName;
            });

            if (isFeatured) {
                if (!isHardPityTriggered) { won5050++; total5050++; }
                rateUpCounter = 0;
                if (pullTime >= mileageStart && pullTime <= mileageEnd) hasReceivedRateUp = true;
            } else {
                total5050++;
            }
            
            currentPity6 = 0;
            currentPity5 = 0;
            
        } else if (pull.rarity === 5) {
            count5++;
            sumPity5 += currentPity5 + 1;
            
            currentPity5 = 0;
            currentPity6++;
            
        } else {
            currentPity6++;
            currentPity5++;
        }
    });

    let mileage = { show: false, current: 0, max: 0, label: "" };
    if (bannerId.includes('standard')) {
        if (currentBannerMileage < 300) {
            mileage = { show: true, current: currentBannerMileage, max: 300, label: "selector_6" };
        }
    } 
    else if (isWeaponType) {
        if (!bannerId.includes('constant')) {
            if (currentBannerMileage < 100) {
                mileage = { 
                    show: true, 
                    current: currentBannerMileage, 
                    max: 100, 
                    label: "arms_offering" 
                };
            } else {
                const offset = currentBannerMileage - 100;
                const phase = Math.floor(offset / 80);
                const nextTarget = 100 + (phase + 1) * 80;
                const isFeaturedNext = phase % 2 === 0;

                mileage = {
                    show: true,
                    current: currentBannerMileage,
                    max: nextTarget,
                    label: isFeaturedNext ? "featured_guarantee" : "arms_offering"
                };
            }
        }
    }
    else if (bannerId.includes('special')) {
        if (hasReceivedRateUp || currentBannerMileage >= 120) {
            mileage = { show: true, current: currentBannerMileage % 240, max: 240, label: "bonus_copy_6" };
        } else {
            mileage = { show: true, current: currentBannerMileage, max: 120, label: "guaranteed_6" };
        }
    }

    return {
        total, pity6: currentPity6, pity5: currentPity5, mileage,
        guarantee120: hasReceivedRateUp ? 0 : rateUpCounter, 
        hasReceivedRateUp, count6, count5,
        avg6: count6 ? (sumPity6 / count6).toFixed(1) : "0.0",
        avg5: count5 ? (sumPity5 / count5).toFixed(1) : "0.0",
        percent6: total ? ((count6 / total) * 100).toFixed(2) : "0.00",
        percent5: total ? ((count5 / total) * 100).toFixed(2) : "0.00",
        winRate: { won: won5050, total: total5050, percent: total5050 ? ((won5050 / total5050) * 100).toFixed(1) : 0 }
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
    for (const p of sortedNew) { if (existingIdsInrange.has(p.id)) { hasMatch = true; break; } }
    if (!hasMatch) {
        const startDate = new Date(minNewTime).toLocaleDateString();
        const endDate = new Date(maxNewTime).toLocaleDateString();
        const $t = get(t);
        throw new Error($t("import.error_account_mismatch", { start: startDate, end: endDate }));
    }
}