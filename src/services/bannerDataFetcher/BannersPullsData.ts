import { BannerType } from "@models/banners/BannerType";
import { CharPullData } from "@services/bannerDataFetcher/entities/CharPullData";
import { WeaponPullData } from "@services/bannerDataFetcher/entities/WeaponPullData";

export interface BannersPullsData {
    [BannerType.CHAR_STANDARD]: CharPullData[],
    [BannerType.CHAR_BEGINNER]: CharPullData[],
    [BannerType.CHAR_SPECIAL]: CharPullData[],
    [BannerType.CHAR_JOINT]: CharPullData[],
    [BannerType.WEAPON]: WeaponPullData[]
}