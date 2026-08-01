import { UserBannerTypeStatEntity } from "@database/entities/UserBannerTypeStatEntity";
import { DbBannerType } from "@models/banners/DbBannerType";

export interface UserWeaponBannerTypeData {
    profileId: bigint;
    bannerType: DbBannerType;
    stat: UserBannerTypeStatEntity;
}