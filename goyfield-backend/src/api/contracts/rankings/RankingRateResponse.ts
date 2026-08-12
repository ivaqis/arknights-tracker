import { BannerTypeStatEntity } from "@models/pullProfile/entities/BannerTypeStatEntity.js";
import { EventBannerTypeStatEntity } from "@models/pullProfile/entities/EventBannerTypeStatEntity.js";

export interface RankingRateResponse {
    stats:
        | EventBannerTypeStatEntity
        | BannerTypeStatEntity
        | null;
}