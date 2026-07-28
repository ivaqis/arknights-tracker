import { BannerType } from "@models/banners/BannerType";
import { CharPull } from "@models/pulls/CharPull";
import { WeaponPull } from "@models/pulls/WeaponPull";

export interface GroupedPullsByDate {
    [BannerType.CHAR_STANDARD]: Map<Date, CharPull[]>,
    [BannerType.CHAR_BEGINNER]: Map<Date, CharPull[]>,
    [BannerType.CHAR_SPECIAL]: Map<Date, CharPull[]>,
    [BannerType.CHAR_JOINT]: Map<Date, CharPull[]>,
    [BannerType.WEAPON]: Map<Date, WeaponPull[]>
}