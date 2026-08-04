import { ExcludeRange } from "@models/ExcludeRange";
import { BannerTypeStatEntity } from "@models/pullProfile/entities/BannerTypeStatEntity";

export interface EventBannerTypeStatEntity extends BannerTypeStatEntity {
    luck5050: {
        winRate: number;
        rating: ExcludeRange;
    } | null;
}