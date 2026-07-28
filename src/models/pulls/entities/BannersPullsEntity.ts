import { BannerType } from "@models/banners/BannerType";
import { CharPullEntity } from "@models/pulls/entities/CharPullEntity";
import { WeaponPullEntity } from "@models/pulls/entities/WeaponPullEntity";
import { BannersPullsData } from "@services/bannerDataFetcher/BannersPullsData";

export interface BannersPullsEntity {
    [BannerType.CHAR_STANDARD]: CharPullEntity[],
    [BannerType.CHAR_BEGINNER]: CharPullEntity[],
    [BannerType.CHAR_SPECIAL]: CharPullEntity[],
    [BannerType.CHAR_JOINT]: CharPullEntity[],
    [BannerType.WEAPON]: WeaponPullEntity[]
}

export namespace BannersPullsEntity {
    export function createFromBannersPulls(pulls: BannersPullsData): BannersPullsEntity {
        return {
            [BannerType.CHAR_STANDARD]: pulls[BannerType.CHAR_STANDARD].map(p => p.getEntity()),
            [BannerType.CHAR_BEGINNER]: pulls[BannerType.CHAR_BEGINNER].map(p => p.getEntity()),
            [BannerType.CHAR_SPECIAL]: pulls[BannerType.CHAR_SPECIAL].map(p => p.getEntity()),
            [BannerType.CHAR_JOINT]: pulls[BannerType.CHAR_JOINT].map(p => p.getEntity()),
            [BannerType.WEAPON]: pulls[BannerType.WEAPON].map(p => p.getEntity()),
        };
    }
}