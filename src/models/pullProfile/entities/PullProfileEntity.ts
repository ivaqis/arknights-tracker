import { DbBannerType } from "@models/banners/DbBannerType";
import { BannerTypeStatEntity } from "@models/pullProfile/entities/BannerTypeStatEntity";
import { EventBannerTypeStatEntity } from "@models/pullProfile/entities/EventBannerTypeStatEntity";

export interface PullProfileEntity {
    profileId: string;
    stats: {
        all: EventBannerTypeStatEntity | null;
        [DbBannerType.CHAR_SPECIAL]: EventBannerTypeStatEntity | null;
        [DbBannerType.CHAR_JOINT]: EventBannerTypeStatEntity | null;
        [DbBannerType.CHAR_STANDARD]: BannerTypeStatEntity | null;
        [DbBannerType.CHAR_BEGINNER]: BannerTypeStatEntity | null;
        [DbBannerType.WEAPON_SPECIAL]: EventBannerTypeStatEntity | null;
        [DbBannerType.WEAPON_STANDARD]: EventBannerTypeStatEntity | null;
    }
}