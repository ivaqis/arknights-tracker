import { UserBannerStatRecord } from "@database/records/UserBannerStatRecord.js";
import { UserCharBannerPullsRecord } from "@database/records/UserCharBannerPullsRecord.js";

export interface UserCharBannerData {
    profileId: bigint;
    bannerId: string;
    stat: UserBannerStatRecord;
    pulls: UserCharBannerPullsRecord;
}