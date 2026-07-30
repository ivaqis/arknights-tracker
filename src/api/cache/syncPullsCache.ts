import { SyncPullsCacheRecord } from "@api/cache/records/SyncPullsCacheRecord";
import { LRUCache } from "lru-cache";

export const syncPullsCache = new LRUCache<string, SyncPullsCacheRecord>({
    ttl: 20 * 60 * 1000,
    max: 1000
});

export const usedSyncPullsTokens = new LRUCache<string, Date>({
    ttl: 20 * 60 * 1000,
    max: 1000
});