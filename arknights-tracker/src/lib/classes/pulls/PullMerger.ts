import type { PullRecord } from "$lib/classes/pulls/PullTypes";
import { PullDateHelper } from "$lib/classes/pulls/PullDateHelper";
import { PullNameCanonicalizer } from "$lib/classes/pulls/PullNameCanonicalizer";

export interface MergePullsReport {
    merged: PullRecord[];
    addedCount: number;
    hasEnriched: boolean;
}

export class PullMerger {
    public static mergePulls(
        oldList: PullRecord[] | null | undefined,
        newList: PullRecord[] | null | undefined
    ): PullRecord[] {
        return this.mergePullsWithReport(oldList, newList).merged;
    }

    public static mergePullsWithReport(
        oldList: PullRecord[] | null | undefined,
        newList: PullRecord[] | null | undefined
    ): MergePullsReport {
        const map = new Map<string, PullRecord>();
        let addedCount = 0;
        let hasEnriched = false;

        for (const raw of oldList || []) {
            const p = this.sanitizePull(raw);
            if (!p) continue;
            const timeMs = p.time.getTime();
            const dedupKey = this.getDedupKey(p, timeMs, p.seqId);
            const existing = map.get(dedupKey);
            if (existing) {
                this.mergeIntoExisting(existing, p);
            } else {
                map.set(dedupKey, p);
            }
        }

        for (const raw of newList || []) {
            const p = this.sanitizePull(raw);
            if (!p) continue;
            const timeMs = p.time.getTime();
            const dedupKey = this.getDedupKey(p, timeMs, p.seqId);
            const existing = map.get(dedupKey);
            if (existing) {
                if (this.mergeIntoExisting(existing, p)) {
                    hasEnriched = true;
                }
            } else {
                map.set(dedupKey, p);
                addedCount++;
            }
        }

        const merged = Array.from(map.values()).sort(PullDateHelper.sortPulls);
        return { merged, addedCount, hasEnriched };
    }

    private static sanitizePull(p: PullRecord | null | undefined): PullRecord | null {
        if (!p?.name || p.name === "undefined" || p.name === "null" || !p.time) {
            return null;
        }

        const d = p.time instanceof Date ? new Date(p.time.getTime()) : new Date(p.time);
        if (Number.isNaN(d.getTime()) || d.getFullYear() < 2000) {
            return null;
        }

        const name = PullNameCanonicalizer.canonicalize(p.name);
        const timeMs = d.getTime();
        const seqId = Number(p.seqId || 0);
        const id = p.id || (seqId > 0 ? `${timeMs}_${name}_${seqId}` : "");

        return {
            ...p,
            id,
            time: d,
            name,
            seqId
        };
    }

    private static getDedupKey(p: PullRecord, timeMs: number, seqId: number): string {
        if (seqId > 0) {
            return `seq_${timeMs}_${p.name.toLowerCase()}_${seqId}`;
        }
        if (p.id) {
            return `id_${String(p.id).toLowerCase()}`;
        }
        return `sig_${timeMs}_${p.name.toLowerCase()}`;
    }

    private static mergeIntoExisting(existing: PullRecord, incoming: PullRecord): boolean {
        let changed = false;
        if (!existing.rawPoolId && incoming.rawPoolId) {
            existing.rawPoolId = incoming.rawPoolId;
            changed = true;
        }
        if (existing.isNew === undefined && incoming.isNew !== undefined) {
            existing.isNew = incoming.isNew;
            changed = true;
        }
        if (existing.isFree === undefined && incoming.isFree !== undefined) {
            existing.isFree = incoming.isFree;
            changed = true;
        }
        if (!existing.status && incoming.status) {
            existing.status = incoming.status;
            changed = true;
        }
        if (existing.isGuaranteed === undefined && incoming.isGuaranteed !== undefined) {
            existing.isGuaranteed = incoming.isGuaranteed;
            changed = true;
        }
        if (!existing.type && incoming.type) {
            existing.type = incoming.type;
            changed = true;
        }
        return changed;
    }
}
