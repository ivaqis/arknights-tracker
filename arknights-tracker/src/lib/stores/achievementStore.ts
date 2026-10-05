import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { achievements, type AchievementData } from '$lib/data/achievements';

export interface TrackedAchievement {
    level: number;
    plated: boolean;
    completedAt?: string;
    synced?: boolean;
}

const STORAGE_KEY = 'tracked_achievements';

const achievementLocaleModules = import.meta.glob('/src/lib/locales/*/achievements.json', {
    eager: true
});

const nameToAchievementIdMap: Record<string, string> = (() => {
    const map: Record<string, string> = {};
    for (const mod of Object.values(achievementLocaleModules as Record<string, any>)) {
        const data = mod?.default || mod || {};
        for (const [id, item] of Object.entries(data as Record<string, any>)) {
            if (item && typeof item === 'object' && item.name) {
                const raw = String(item.name).trim();
                const clean = raw.replace(/^["'“”«»`]+|["'“”«»`]+$/g, '').trim();
                map[raw.toLowerCase()] = id;
                map[clean.toLowerCase()] = id;
            }
        }
    }
    return map;
})();

function loadInitialData(): Record<string, TrackedAchievement> {
    if (!browser) return {};
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {}
    return {};
}

export const achievementStore = writable<Record<string, TrackedAchievement>>(loadInitialData());

if (browser) {
    achievementStore.subscribe((value) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        } catch (e) {}
    });
}

export function extractMedalsFromProfile(source: any): any[] {
    if (!source) return [];
    if (Array.isArray(source)) {
        if (source.length > 0 && (source[0]?.achievementData || source[0]?.obtainTs !== undefined || source[0]?.cate || source[0]?.name || source[0]?.id)) {
            return source;
        }
        const medals: any[] = [];
        for (const item of source) {
            medals.push(...extractMedalsFromProfile(item));
        }
        return medals;
    }
    if (typeof source === 'string') {
        try {
            const parsed = JSON.parse(source);
            return extractMedalsFromProfile(parsed);
        } catch {
            return [];
        }
    }
    if (typeof source === 'object') {
        if (source.achieveMedals && Array.isArray(source.achieveMedals)) {
            return source.achieveMedals;
        }
        if (source.medals && Array.isArray(source.medals)) {
            return source.medals;
        }
        if (source.achievements && Array.isArray(source.achievements)) {
            return source.achievements;
        }
        if (source.achieve) {
            const found = extractMedalsFromProfile(source.achieve);
            if (found.length > 0) return found;
        }
        if (source.detail) {
            const found = extractMedalsFromProfile(source.detail);
            if (found.length > 0) return found;
        }
        if (source.info) {
            const found = extractMedalsFromProfile(source.info);
            if (found.length > 0) return found;
        }
        if (source.account_info) {
            const found = extractMedalsFromProfile(source.account_info);
            if (found.length > 0) return found;
        }
        if (source.gameProfile) {
            const found = extractMedalsFromProfile(source.gameProfile);
            if (found.length > 0) return found;
        }
        if (Array.isArray(source.details)) {
            return extractMedalsFromProfile(source.details);
        }
        if (Array.isArray(source.gameProfiles)) {
            return extractMedalsFromProfile(source.gameProfiles);
        }
    }
    return [];
}

export function syncAchievementsFromProfile(source: any): { syncedCount: number; updatedCount: number; totalFound: number } {
    const medals = extractMedalsFromProfile(source);
    if (!medals || medals.length === 0) {
        return { syncedCount: 0, updatedCount: 0, totalFound: 0 };
    }

    const nextState: Record<string, TrackedAchievement> = {};
    let syncedCount = 0;

    for (const m of medals) {
        const achData = m?.achievementData || m;
        if (!achData) continue;
        const rawName = String(achData.name || m.name || '').trim();
        const cleanName = rawName.replace(/^["'“”«»`]+|["'“”«»`]+$/g, '').trim();
        const rawId = String(achData.id || m.id || '').trim();
        const achId =
            (rawId && achievements[rawId] ? rawId : null) ||
            (rawName && (nameToAchievementIdMap[rawName.toLowerCase()] || nameToAchievementIdMap[cleanName.toLowerCase()])) ||
            (rawId && (nameToAchievementIdMap[rawId.toLowerCase()] || rawId)) ||
            null;

        if (!achId) continue;

        syncedCount += 1;
        const rawLevel = Number(m.level ?? achData.level ?? 1) || 1;
        const meta = achievements[achId];
        const sortedLevels = meta ? Object.keys(meta.levelInfos || {}).map(Number).sort((a, b) => a - b) : [1];
        const levelsList = sortedLevels.length > 0 ? sortedLevels : [meta?.initLevel || 1];
        let targetLevel = levelsList[0];
        if (levelsList.length > 1) {
            const idx = Math.min(Math.max(rawLevel - 1, 0), levelsList.length - 1);
            targetLevel = levelsList[idx];
        } else {
            targetLevel = levelsList[0];
        }

        const gamePlated = Boolean(m.isPlated ?? achData.isPlated);
        const rawTs = m.obtainTs ?? achData.obtainTs;
        const obtainTs = rawTs ? Number(rawTs) : null;
        let completedAt: string | undefined;
        if (obtainTs && !isNaN(obtainTs) && obtainTs > 0) {
            const ms = obtainTs > 1e11 ? obtainTs : obtainTs * 1000;
            completedAt = new Date(ms).toISOString();
        }

        nextState[achId] = {
            level: targetLevel,
            plated: gamePlated,
            completedAt,
            synced: true
        };
    }

    achievementStore.set(nextState);
    return { syncedCount, updatedCount: syncedCount, totalFound: medals.length };
}

export function toggleAchievementLevel(
    id: string,
    level: number,
    maxLevel: number,
    isPlateable: boolean
) {
    achievementStore.update((state) => {
        const current = state[id] || { level: 0, plated: false };
        const currentLevel = current.level || 0;
        let nextLevel = currentLevel;
        let nextPlated = current.plated;
        let completedAt = current.completedAt;

        if (currentLevel >= level) {
            nextLevel = level - 1;
            nextPlated = false;
            completedAt = undefined;
        } else {
            nextLevel = level;
            if (nextLevel >= maxLevel && (!isPlateable || nextPlated)) {
                completedAt = completedAt || new Date().toISOString();
            }
        }

        return {
            ...state,
            [id]: {
                level: nextLevel,
                plated: nextPlated,
                completedAt,
                synced: false
            }
        };
    });
}

export function toggleAchievementPlate(
    id: string,
    maxLevel: number
) {
    achievementStore.update((state) => {
        const current = state[id] || { level: 0, plated: false };
        const nextPlated = !current.plated;
        let nextLevel = current.level || 0;
        let completedAt = current.completedAt;

        if (nextPlated) {
            nextLevel = maxLevel;
            completedAt = completedAt || new Date().toISOString();
        } else {
            completedAt = undefined;
        }

        return {
            ...state,
            [id]: {
                level: nextLevel,
                plated: nextPlated,
                completedAt,
                synced: false
            }
        };
    });
}

export function getAchievementStepsCount(ach: AchievementData): number {
    const levels = Object.keys(ach.levelInfos || {});
    const levelCount = levels.length > 0 ? levels.length : 1;
    const plateCount = ach.plateable || (ach.plateConditions && ach.plateConditions.length > 0) ? 1 : 0;
    return levelCount + plateCount;
}

export function getAchievementCompletedSteps(
    ach: AchievementData,
    tracked?: TrackedAchievement
): number {
    if (!tracked) return 0;
    let completed = 0;
    const sortedLevels = Object.keys(ach.levelInfos || {})
        .map(Number)
        .sort((a, b) => a - b);
    const levels = sortedLevels.length > 0 ? sortedLevels : [ach.initLevel];
    for (const lvl of levels) {
        if ((tracked.level || 0) >= lvl) {
            completed += 1;
        }
    }
    if ((ach.plateable || (ach.plateConditions && ach.plateConditions.length > 0)) && tracked.plated) {
        completed += 1;
    }
    return completed;
}

export function isAchievementFullyCompleted(
    ach: AchievementData,
    tracked?: TrackedAchievement
): boolean {
    if (!tracked) return false;
    const totalSteps = getAchievementStepsCount(ach);
    const completedSteps = getAchievementCompletedSteps(ach, tracked);
    return totalSteps > 0 && completedSteps >= totalSteps;
}

export function getCategoryProgress(
    groupIds: string[],
    allAchievements: Record<string, AchievementData>,
    progress: Record<string, TrackedAchievement>
): { completed: number; total: number; percent: number } {
    const groupSet = new Set(groupIds);
    let total = 0;
    let completed = 0;

    for (const ach of Object.values(allAchievements)) {
        if (groupSet.has(ach.groupId)) {
            total += getAchievementStepsCount(ach);
            completed += getAchievementCompletedSteps(ach, progress[ach.id]);
        }
    }

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
}

export function getTotalProgress(
    allAchievements: Record<string, AchievementData>,
    progress: Record<string, TrackedAchievement>
): { completed: number; total: number; percent: number } {
    const list = Object.values(allAchievements);
    let total = 0;
    let completed = 0;

    for (const ach of list) {
        total += getAchievementStepsCount(ach);
        completed += getAchievementCompletedSteps(ach, progress[ach.id]);
    }

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
}
