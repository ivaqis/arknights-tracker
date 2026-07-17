import { LRUCache } from "lru-cache";

export const lastGameProfileSyncCache = new LRUCache<string, Date>({
    max: Infinity,
    ttl: 15 * 60 * 1000
});