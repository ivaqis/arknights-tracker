import { UserBannerTypeStatEntity } from "@database/entities/UserBannerTypeStatEntity.js";
import { DbBannerType } from "@models/banners/DbBannerType.js";

export interface UserWeaponBannerTypeData {
    profileId: bigint;
    bannerType: DbBannerType;
    stat: UserBannerTypeStatEntity;
}