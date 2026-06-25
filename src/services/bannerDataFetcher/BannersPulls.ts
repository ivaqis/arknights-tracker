import { BannerType } from "@models/banners/BannerType";
import { CharPull } from "@models/pulls/CharPull";
import { WeaponPull } from "@models/pulls/WeaponPull";

export interface BannersPulls {
    [BannerType.CHAR_STANDARD]: CharPull[],
    [BannerType.CHAR_BEGINNER]: CharPull[],
    [BannerType.CHAR_SPECIAL]: CharPull[],
    [BannerType.CHAR_JOINT]: CharPull[],
    [BannerType.WEAPON]: WeaponPull[]
}