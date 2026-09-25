import { LRUCache } from "lru-cache";

export const lastGameProfileSyncCache = new LRUCache<string, Date>({
    ttl: 15 * 60 * 1000,
    max: 1000
});