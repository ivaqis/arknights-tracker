import { BannersPulls } from "@models/pulls/BannersPulls";

export interface SyncPullsCacheRecord {
    requestedUid: string | null;
    tid: string;
    uidByTid: string | null;
    pid: string | null;
    uidByPid: string | null;
    pulls: BannersPulls;
}