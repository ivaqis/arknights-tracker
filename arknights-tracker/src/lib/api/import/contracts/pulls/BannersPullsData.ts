import type { CharPullData } from "$lib/api/import/contracts/pulls/CharPullData";
import type { WeaponPullData } from "$lib/api/import/contracts/pulls/WeaponPullData";
import { GameBannerType } from "$lib/classes/banners/GameBannerType";

export interface BannersPullsData {
    [GameBannerType.CHAR_STANDARD]: CharPullData[],
    [GameBannerType.CHAR_BEGINNER]: CharPullData[],
    [GameBannerType.CHAR_SPECIAL]: CharPullData[],
    [GameBannerType.CHAR_JOINT]: CharPullData[],
    [GameBannerType.WEAPON]: WeaponPullData[]
}