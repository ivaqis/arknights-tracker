import { UserBannerStatRecord } from "@database/records/UserBannerStatRecord";
import { UserCharBannerPullsRecord } from "@database/records/UserCharBannerPullsRecord";

export interface UserCharBannerData {
    profileId: bigint;
    bannerId: string;
    stat: UserBannerStatRecord;
    pulls: UserCharBannerPullsRecord;
}