import { SyncPullsCacheRecord } from "@api/cache/records/SyncPullsCacheRecord";
import { LRUCache } from "lru-cache";

export const syncPullsCache = new LRUCache<string, SyncPullsCacheRecord>({
    ttl: 15 * 60 * 1000,
    max: 1000
});