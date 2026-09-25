import type { GlobalBannerData } from "$lib/api/globalBannerStats/contracts/GlobalBannerData";

export interface GlobalBannerStatsResponse {
    bannerId: string;
    stats: GlobalBannerData;
}