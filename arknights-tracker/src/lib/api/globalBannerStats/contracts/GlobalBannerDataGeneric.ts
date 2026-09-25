import type { GlobalBannerDataType } from "$lib/api/globalBannerStats/contracts/GlobalBannerDataType";
import type { GlobalItemStatData } from "$lib/api/globalBannerStats/contracts/items/GlobalItemStatData";
import type {
    GlobalPityDistributionData
} from "$lib/api/globalBannerStats/contracts/pityDistribution/GlobalPityDistributionData";
import type { FeaturedFreeStatsData } from "$lib/api/globalBannerStats/contracts/stats/featured/FeaturedFreeStatsData";
import type {
    FeaturedGuaranteedStatsData
} from "$lib/api/globalBannerStats/contracts/stats/featured/FeaturedGuaranteedStatsData";
import type { FeaturedStatsData } from "$lib/api/globalBannerStats/contracts/stats/featured/FeaturedStatsData";
import type {
    OverviewArsenalTicketStatsData
} from "$lib/api/globalBannerStats/contracts/stats/overview/OverviewArsenalTicketStatsData";
import type { OverviewFreeStatsData } from "$lib/api/globalBannerStats/contracts/stats/overview/OverviewFreeStatsData";
import type {
    OverviewOroberylStatsData
} from "$lib/api/globalBannerStats/contracts/stats/overview/OverviewOroberylStatsData";
import type { OverviewStatsData } from "$lib/api/globalBannerStats/contracts/stats/overview/OverviewStatsData";
import type { Stats5Data } from "$lib/api/globalBannerStats/contracts/stats/stats5/Stats5Data";
import type { Stats5FreeData } from "$lib/api/globalBannerStats/contracts/stats/stats5/Stats5FreeData";
import type { Stats5PityData } from "$lib/api/globalBannerStats/contracts/stats/stats5/Stats5PityData";
import type { Stats6Data } from "$lib/api/globalBannerStats/contracts/stats/stats6/Stats6Data";
import type { Stats6FreeData } from "$lib/api/globalBannerStats/contracts/stats/stats6/Stats6FreeData";
import type { Stats6FreeWinrateData } from "$lib/api/globalBannerStats/contracts/stats/stats6/Stats6FreeWinrateData";
import type { Stats6WinrateData } from "$lib/api/globalBannerStats/contracts/stats/stats6/Stats6WinrateData";
import type {
    GlobalTimelineGenericData
} from "$lib/api/globalBannerStats/contracts/timeline/GlobalTimelineGenericData";

export interface GlobalBannerDataGeneric {
    type: GlobalBannerDataType;
    stats: {
        featured?:
            & FeaturedStatsData
            & Partial<FeaturedFreeStatsData>
            & Partial<FeaturedGuaranteedStatsData>;
        overview:
            & OverviewStatsData
            & Partial<OverviewFreeStatsData>
            & Partial<OverviewOroberylStatsData>
            & Partial<OverviewArsenalTicketStatsData>;
        stats6:
            & Stats6Data
            & Partial<Stats6FreeData>
            & Partial<Stats6WinrateData>
            & Partial<Stats6FreeWinrateData>;
        stats5:
            & Stats5Data
            & Partial<Stats5PityData>
            & Partial<Stats5FreeData>;
    };
    timeline: GlobalTimelineGenericData[];
    pityDistribution6: GlobalPityDistributionData[];
    pityDistribution5?: GlobalPityDistributionData[];
    items6: GlobalItemStatData[];
    items5: GlobalItemStatData[];
}