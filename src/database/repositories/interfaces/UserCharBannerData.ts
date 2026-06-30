import { UserBannerStatRecord } from "@database/records/UserBannerStatRecord";
import { UserBannerTypeStatRecord } from "@database/records/UserBannerTypeStatRecord";
import { UserCharBannerPullsRecord } from "@database/records/UserCharBannerPullsRecord";
import { UserCharBannerTypePullsRecord } from "@database/records/UserCharBannerTypePullsRecord";

export interface UserCharBannerData {
    bannerStat: UserBannerStatRecord,
    bannerTypeStat: UserBannerTypeStatRecord,
    bannerPulls: UserCharBannerPullsRecord,
    bannerTypePulls: UserCharBannerTypePullsRecord
}