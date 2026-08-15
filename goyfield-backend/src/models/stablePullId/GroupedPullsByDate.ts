import { BannerType } from "@models/banners/BannerType.js";
import { CharPull } from "@models/pulls/CharPull.js";
import { WeaponPull } from "@models/pulls/WeaponPull.js";

export interface GroupedPullsByDate {
    [BannerType.CHAR_STANDARD]: Map<Date, CharPull[]>,
    [BannerType.CHAR_BEGINNER]: Map<Date, CharPull[]>,
    [BannerType.CHAR_SPECIAL]: Map<Date, CharPull[]>,
    [BannerType.CHAR_JOINT]: Map<Date, CharPull[]>,
    [BannerType.WEAPON]: Map<Date, WeaponPull[]>
}