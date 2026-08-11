import { GlobalBannerData } from "@models/globalBannerStats/GlobalBannerData.js";

export interface GlobalStatsResponse {
    bannerId: string;
    stats: GlobalBannerData;
}