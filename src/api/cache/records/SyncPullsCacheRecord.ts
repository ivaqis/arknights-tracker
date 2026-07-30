import { BannerTokenId } from "@models/bannerTokenId/BannerTokenId";
import { BannersPulls } from "@models/pulls/BannersPulls";
import { StablePullId } from "@models/stablePullId/StablePullId";

export interface SyncPullsCacheRecord {
    profileId: string | null;
    tokenId: BannerTokenId;
    pullIds: StablePullId[];
    pulls: BannersPulls;
}