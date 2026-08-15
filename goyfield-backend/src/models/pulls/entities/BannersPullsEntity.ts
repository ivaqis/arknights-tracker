import { BannerType } from "@models/banners/BannerType.js";
import { CharPullEntity } from "@models/pulls/entities/CharPullEntity.js";
import { WeaponPullEntity } from "@models/pulls/entities/WeaponPullEntity.js";

export interface BannersPullsEntity {
    [BannerType.CHAR_STANDARD]: CharPullEntity[],
    [BannerType.CHAR_BEGINNER]: CharPullEntity[],
    [BannerType.CHAR_SPECIAL]: CharPullEntity[],
    [BannerType.CHAR_JOINT]: CharPullEntity[],
    [BannerType.WEAPON]: WeaponPullEntity[]
}