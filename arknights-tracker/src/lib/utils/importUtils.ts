import type { BannerStatsResult, LcsMatchRecord, PullRecord } from "$lib/classes/pulls/PullTypes";
import { PullNameCanonicalizer } from "$lib/classes/pulls/PullNameCanonicalizer";
import { PullParser } from "$lib/classes/pulls/PullParser";
import { PullMerger, type MergePullsReport } from "$lib/classes/pulls/PullMerger";
import { PullPityCalculator } from "$lib/classes/pulls/PullPityCalculator";
import { PullStatsCalculator } from "$lib/classes/pulls/PullStatsCalculator";
import { PullLcsMatcher } from "$lib/classes/pulls/PullLcsMatcher";

export { AccountMismatchError } from "$lib/classes/pulls/PullLcsMatcher";

export function canonicalizeName(rawName: string | null | undefined): string {
    return PullNameCanonicalizer.canonicalize(rawName);
}

export function isWeaponBanner(rawId: string | number | null | undefined): boolean {
    return PullParser.isWeaponBanner(rawId);
}

export function getInternalBannerType(rawId: string | number | null | undefined): string {
    return PullParser.getInternalBannerType(rawId);
}

export function getWeaponCategory(bannerId: string | null | undefined): string {
    return PullParser.getWeaponCategory(bannerId);
}

export function parseGachaLog(list: any[]): PullRecord[] {
    return PullParser.parseGachaLog(list);
}

export function mergePulls(
    oldList: PullRecord[] | null | undefined,
    newList: PullRecord[] | null | undefined
): PullRecord[] {
    return PullMerger.mergePulls(oldList, newList);
}

export function mergePullsWithReport(
    oldList: PullRecord[] | null | undefined,
    newList: PullRecord[] | null | undefined
): MergePullsReport {
    return PullMerger.mergePullsWithReport(oldList, newList);
}

export function calculatePity(
    pulls: PullRecord[],
    bannerId: string,
    accountServerId: string | null = null
): PullRecord[] {
    return PullPityCalculator.calculate(pulls, bannerId, accountServerId);
}

export function calculateBannerStats(
    pulls: PullRecord[],
    bannerId: string,
    accountServerId: string | null = null
): BannerStatsResult {
    return PullStatsCalculator.calculate(pulls, bannerId, accountServerId);
}

export function findLCSMatches(
    existingPulls: PullRecord[],
    newPulls: PullRecord[]
): LcsMatchRecord[] {
    return PullLcsMatcher.findMatches(existingPulls, newPulls);
}

export function validateAccountConsistency(
    existingPulls: PullRecord[],
    newPulls: PullRecord[],
    isRecoveryEnabled = false
): void {
    PullLcsMatcher.validateConsistency(existingPulls, newPulls, isRecoveryEnabled);
}

