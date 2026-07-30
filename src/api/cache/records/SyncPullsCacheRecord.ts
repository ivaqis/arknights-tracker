import { BannersPulls } from "@models/pulls/BannersPulls";

export interface SyncPullsCacheRecord {
    profileId: string | null;
    pulls: BannersPulls;
}