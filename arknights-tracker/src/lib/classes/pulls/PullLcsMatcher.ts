import type { LcsMatchRecord, PullRecord } from "$lib/classes/pulls/PullTypes";
import { PullDateHelper } from "$lib/classes/pulls/PullDateHelper";
import { get } from "svelte/store";
import { currentUiLocale, normalizeLocale } from "$lib/stores/locale";

export class AccountMismatchError extends Error {
    public readonly code: "ACCOUNT_MISMATCH" | "ACCOUNT_MISMATCH_RECOVERY";
    public readonly params?: { start?: string; end?: string };

    constructor(code: "ACCOUNT_MISMATCH" | "ACCOUNT_MISMATCH_RECOVERY", params?: { start?: string; end?: string }) {
        super(code);
        this.name = "AccountMismatchError";
        this.code = code;
        this.params = params;
    }
}

export class PullLcsMatcher {
    private static getWeight(rarity: number): number {
        switch (rarity) {
            case 6: return 100;
            case 5: return 10;
            case 4: return 2;
            default: return 1;
        }
    }

    private static isSamePull(a: PullRecord, b: PullRecord): boolean {
        const normA = String(a.name || "").toLowerCase().trim();
        const normB = String(b.name || "").toLowerCase().trim();
        if (normA !== normB) return false;

        const isSameType = !a.type || !b.type || a.type === b.type;
        if (!isSameType) return false;

        const seqA = Number(a.seqId || 0);
        const seqB = Number(b.seqId || 0);
        if (seqA > 0 && seqB > 0 && seqA !== seqB) {
            return false;
        }

        const timeA = a.time instanceof Date ? a.time.getTime() : new Date(a.time).getTime();
        const timeB = b.time instanceof Date ? b.time.getTime() : new Date(b.time).getTime();
        if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeA > 0 && timeB > 0) {
            if (Math.abs(timeA - timeB) > 30 * 24 * 60 * 60 * 1000) {
                return false;
            }
        }

        return true;
    }

    private static backtrackMatches(
        sortedExisting: PullRecord[],
        sortedNew: PullRecord[],
        dp: Int32Array[]
    ): LcsMatchRecord[] {
        let i = sortedExisting.length;
        let j = sortedNew.length;
        const matches: LcsMatchRecord[] = [];

        while (i > 0 && j > 0) {
            const oldP = sortedExisting[i - 1];
            const newP = sortedNew[j - 1];

            if (this.isSamePull(oldP, newP)) {
                matches.push({ oldPull: oldP, newPull: newP });
                i--;
                j--;
            } else if (dp[i - 1][j] >= dp[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }

        return matches.reverse();
    }

    public static findMatches(existingPulls: PullRecord[], newPulls: PullRecord[]): LcsMatchRecord[] {
        if (!existingPulls.length || !newPulls.length) return [];

        const sortedExisting = [...existingPulls].sort(PullDateHelper.sortPulls);
        const sortedNew = [...newPulls].sort(PullDateHelper.sortPulls);

        const n = sortedExisting.length;
        const m = sortedNew.length;

        const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));

        for (let i = 1; i <= n; i++) {
            const oldP = sortedExisting[i - 1];
            const oldWeight = this.getWeight(oldP.rarity);
            for (let j = 1; j <= m; j++) {
                const newP = sortedNew[j - 1];
                if (this.isSamePull(oldP, newP)) {
                    dp[i][j] = dp[i - 1][j - 1] + oldWeight;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        return this.backtrackMatches(sortedExisting, sortedNew, dp);
    }

    public static validateConsistency(
        existingPulls: PullRecord[],
        newPulls: PullRecord[],
        isRecoveryEnabled = false
    ): void {
        if (!existingPulls.length || !newPulls.length) {
            return;
        }

        const validNew = newPulls.filter(p => typeof p?.time?.getTime === "function" && !Number.isNaN(p.time.getTime()));
        if (validNew.length === 0) {
            return;
        }

        const sortedNew = [...validNew].sort(PullDateHelper.sortPulls);
        const minNewTime = sortedNew[0].time.getTime();
        const maxNewTime = sortedNew.at(-1)!.time.getTime();

        const overlaps = existingPulls.filter(p => {
            if (typeof p?.time?.getTime !== "function" || Number.isNaN(p.time.getTime())) {
                return false;
            }
            const time = p.time.getTime();
            return (minNewTime - 86400000) <= time && time <= (maxNewTime + 86400000);
        });

        if (overlaps.length === 0) {
            return;
        }

        const existingSignatures = new Set(overlaps.map(p => `${p.time.getTime()}_${String(p.name || "").toLowerCase().trim()}`));
        let hasMatch = sortedNew.some(p => existingSignatures.has(`${p.time.getTime()}_${String(p.name || "").toLowerCase().trim()}`));

        if (!hasMatch) {
            const existingSecSignatures = new Set(overlaps.map(p => `${Math.floor(p.time.getTime() / 1000)}_${String(p.name || "").toLowerCase().trim()}`));
            hasMatch = sortedNew.some(p => existingSecSignatures.has(`${Math.floor(p.time.getTime() / 1000)}_${String(p.name || "").toLowerCase().trim()}`));
        }

        if (!hasMatch && isRecoveryEnabled) {
            const matches = this.findMatches(overlaps, sortedNew);
            if (matches.length > 0) {
                return;
            }
            throw new AccountMismatchError("ACCOUNT_MISMATCH_RECOVERY");
        }

        if (!hasMatch) {
            const loc = normalizeLocale(typeof window !== "undefined" ? get(currentUiLocale) : "en-US");
            const startDate = new Date(minNewTime).toLocaleDateString(loc);
            const endDate = new Date(maxNewTime).toLocaleDateString(loc);
            throw new AccountMismatchError("ACCOUNT_MISMATCH", { start: startDate, end: endDate });
        }
    }
}
