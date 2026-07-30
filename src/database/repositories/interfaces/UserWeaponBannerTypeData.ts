import { UserBannerTypeStatRecord } from "@database/records/UserBannerTypeStatRecord";
import { DbBannerType } from "@models/banners/DbBannerType";

export interface UserWeaponBannerTypeData {
    profileId: bigint;
    bannerType: DbBannerType;
    stat:UserBannerTypeStatRecord;
}