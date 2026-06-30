import { UserBannerStatRecord } from "@database/records/UserBannerStatRecord";
import { UserBannerTypeStatRecord } from "@database/records/UserBannerTypeStatRecord";
import { UserWeaponBannerPullsRecord } from "@database/records/UserWeaponBannerPullsRecord";

export interface UserWeaponBannerData {
    bannerStat: UserBannerStatRecord,
    bannerTypeStat: UserBannerTypeStatRecord,
    bannerPulls: UserWeaponBannerPullsRecord
}