import { BannerType } from "@models/banners/BannerType.js";
import { CharPullData } from "@services/bannerDataFetcher/entities/CharPullData.js";
import { WeaponPullData } from "@services/bannerDataFetcher/entities/WeaponPullData.js";

export interface BannersPullsData {
    [BannerType.CHAR_STANDARD]: CharPullData[],
    [BannerType.CHAR_BEGINNER]: CharPullData[],
    [BannerType.CHAR_SPECIAL]: CharPullData[],
    [BannerType.CHAR_JOINT]: CharPullData[],
    [BannerType.WEAPON]: WeaponPullData[]
}