import { GlobalBannerDataType } from "$lib/api/globalBannerStats/contracts/GlobalBannerDataType";
import type { GlobalItemStatData } from "$lib/api/globalBannerStats/contracts/items/GlobalItemStatData";
import type {
    GlobalPityDistributionData
} from "$lib/api/globalBannerStats/contracts/pityDistribution/GlobalPityDistributionData";
import type {
    FeaturedGuaranteedStatsData
} from "$lib/api/globalBannerStats/contracts/stats/featured/FeaturedGuaranteedStatsData";
import type { FeaturedStatsData } from "$lib/api/globalBannerStats/contracts/stats/featured/FeaturedStatsData";
import type {
    OverviewArsenalTicketStatsData
} from "$lib/api/globalBannerStats/contracts/stats/overview/OverviewArsenalTicketStatsData";
import type { OverviewStatsData } from "$lib/api/globalBannerStats/contracts/stats/overview/OverviewStatsData";
import type { Stats5Data } from "$lib/api/globalBannerStats/contracts/stats/stats5/Stats5Data";
import type { Stats6Data } from "$lib/api/globalBannerStats/contracts/stats/stats6/Stats6Data";
import type { Stats6WinrateData } from "$lib/api/globalBannerStats/contracts/stats/stats6/Stats6WinrateData";
import type { GlobalTimelineData } from "$lib/api/globalBannerStats/contracts/timeline/GlobalTimelineData";

export interface GlobalBannerDataWeaponV1 {
    type: GlobalBannerDataType.WEAPON_V1;
    stats: {
        featured:
            & FeaturedStatsData
            & FeaturedGuaranteedStatsData;
        overview:
            & OverviewStatsData
            & OverviewArsenalTicketStatsData;
        stats6:
            & Stats6Data
            & Stats6WinrateData;
        stats5: Stats5Data;
    };
    timeline: GlobalTimelineData[];
    pityDistribution6: GlobalPityDistributionData[];
    items6: GlobalItemStatData[];
    items5: GlobalItemStatData[];
}