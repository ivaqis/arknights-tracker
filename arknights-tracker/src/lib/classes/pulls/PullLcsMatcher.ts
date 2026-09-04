import type { LcsMatchRecord, PullRecord } from "$lib/classes/pulls/PullTypes";
import { PullDateHelper } from "$lib/classes/pulls/PullDateHelper";

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
        const isSameType = !a.type || !b.type || a.type === b.type;
        return normA === normB && isSameType;
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

        if (isRecoveryEnabled) {
            const matches = this.findMatches(existingPulls, newPulls);
            if (matches.length === 0) {
                throw new AccountMismatchError("ACCOUNT_MISMATCH_RECOVERY");
            }
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
            return minNewTime <= time && time <= maxNewTime;
        });

        if (overlaps.length === 0) {
            return;
        }

        const existingSignatures = new Set(overlaps.map(p => `${p.time.getTime()}_${p.name}`));
        const hasMatch = sortedNew.some(p => existingSignatures.has(`${p.time.getTime()}_${p.name}`));

        if (!hasMatch) {
            const startDate = new Date(minNewTime).toLocaleDateString();
            const endDate = new Date(maxNewTime).toLocaleDateString();
            throw new AccountMismatchError("ACCOUNT_MISMATCH", { start: startDate, end: endDate });
        }
    }
}
