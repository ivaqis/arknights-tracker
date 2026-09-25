import { GlobalBannerDataType } from "$lib/api/globalBannerStats/contracts/GlobalBannerDataType";
import type { GlobalItemStatData } from "$lib/api/globalBannerStats/contracts/items/GlobalItemStatData";
import type {
    GlobalPityDistributionData
} from "$lib/api/globalBannerStats/contracts/pityDistribution/GlobalPityDistributionData";
import type { FeaturedFreeStatsData } from "$lib/api/globalBannerStats/contracts/stats/featured/FeaturedFreeStatsData";
import type { FeaturedStatsData } from "$lib/api/globalBannerStats/contracts/stats/featured/FeaturedStatsData";
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
import type { GlobalTimelineData } from "$lib/api/globalBannerStats/contracts/timeline/GlobalTimelineData";
import type { GlobalTimelineFreeData } from "$lib/api/globalBannerStats/contracts/timeline/GlobalTimelineFreeData";

export interface GlobalBannerDataJointV2 {
    type: GlobalBannerDataType.JOINT_V2;
    stats: {
        featured:
            & FeaturedStatsData
            & FeaturedFreeStatsData;
        overview:
            & OverviewStatsData
            & OverviewFreeStatsData
            & OverviewOroberylStatsData;
        stats6:
            & Stats6Data
            & Stats6WinrateData
            & Stats6FreeData
            & Stats6FreeWinrateData;
        stats5:
            & Stats5Data
            & Stats5FreeData
            & Stats5PityData;
    };
    timeline: (
        & GlobalTimelineData
        & GlobalTimelineFreeData
        )[];
    pityDistribution6: GlobalPityDistributionData[];
    pityDistribution5: GlobalPityDistributionData[];
    items6: GlobalItemStatData[];
    items5: GlobalItemStatData[];
}