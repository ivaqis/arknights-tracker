import { ExcludeRange } from "@models/ExcludeRange.js";
import { BannerTypeStatEntity } from "@models/pullProfile/entities/BannerTypeStatEntity.js";

export interface EventBannerTypeStatEntity extends BannerTypeStatEntity {
    luck5050: {
        winRate: number;
        rating: ExcludeRange;
    } | null;
}