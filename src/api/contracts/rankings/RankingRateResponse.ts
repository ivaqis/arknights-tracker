import { BannerTypeStatEntity } from "@models/pullProfile/entities/BannerTypeStatEntity";
import { EventBannerTypeStatEntity } from "@models/pullProfile/entities/EventBannerTypeStatEntity";

export interface RankingRateResponse {
    stats:
        | EventBannerTypeStatEntity
        | BannerTypeStatEntity
        | null;
}