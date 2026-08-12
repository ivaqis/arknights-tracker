import { BannerTokenId } from "@models/bannerTokenId/BannerTokenId.js";
import { BannersPulls } from "@models/pulls/BannersPulls.js";
import { StablePullId } from "@models/stablePullId/StablePullId.js";

export interface SyncPullsCacheRecord {
    profileId: string | null;
    tokenId: BannerTokenId;
    pullIds: StablePullId[];
    pulls: BannersPulls;
}