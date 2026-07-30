import { UserBannerTypeStatRecord } from "@database/records/UserBannerTypeStatRecord";
import { UserCharBannerTypePullsRecord } from "@database/records/UserCharBannerTypePullsRecord";
import { DbBannerType } from "@models/banners/DbBannerType";

export interface UserCharBannerTypeData {
    profileId: bigint;
    bannerType: DbBannerType;
    stat: UserBannerTypeStatRecord;
    pulls: UserCharBannerTypePullsRecord;
}