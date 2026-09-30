import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { AchievementData } from '$lib/data/achievements';

export interface TrackedAchievement {
    level: number;
    plated: boolean;
    completedAt?: string;
}

const STORAGE_KEY = 'tracked_achievements';

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
                completedAt
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
                completedAt
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
