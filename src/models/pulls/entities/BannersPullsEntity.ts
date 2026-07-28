import { BannerType } from "@models/banners/BannerType";
import { CharPullEntity } from "@models/pulls/entities/CharPullEntity";
import { WeaponPullEntity } from "@models/pulls/entities/WeaponPullEntity";

export interface BannersPullsEntity {
    [BannerType.CHAR_STANDARD]: CharPullEntity[],
    [BannerType.CHAR_BEGINNER]: CharPullEntity[],
    [BannerType.CHAR_SPECIAL]: CharPullEntity[],
    [BannerType.CHAR_JOINT]: CharPullEntity[],
    [BannerType.WEAPON]: WeaponPullEntity[]
}