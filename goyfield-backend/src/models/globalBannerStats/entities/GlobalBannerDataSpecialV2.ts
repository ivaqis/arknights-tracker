import { GlobalItemStatData } from "@models/globalBannerStats/entities/items/GlobalItemStatData.js";
import {
    GlobalPityDistributionData
} from "@models/globalBannerStats/entities/pityDistribution/GlobalPityDistributionData.js";
import { FeaturedFreeStatsData } from "@models/globalBannerStats/entities/stats/featured/FeaturedFreeStatsData.js";
import {
    FeaturedGuaranteedStatsData
} from "@models/globalBannerStats/entities/stats/featured/FeaturedGuaranteedStatsData.js";
import { FeaturedStatsData } from "@models/globalBannerStats/entities/stats/featured/FeaturedStatsData.js";
import { OverviewFreeStatsData } from "@models/globalBannerStats/entities/stats/overview/OverviewFreeStatsData.js";
import {
    OverviewOroberylStatsData
} from "@models/globalBannerStats/entities/stats/overview/OverviewOroberylStatsData.js";
import { OverviewStatsData } from "@models/globalBannerStats/entities/stats/overview/OverviewStatsData.js";
import { Stats5Data } from "@models/globalBannerStats/entities/stats/stats5/Stats5Data.js";
import { Stats5FreeData } from "@models/globalBannerStats/entities/stats/stats5/Stats5FreeData.js";
import { Stats5PityData } from "@models/globalBannerStats/entities/stats/stats5/Stats5PityData.js";
import { Stats6Data } from "@models/globalBannerStats/entities/stats/stats6/Stats6Data.js";
import { Stats6FreeData } from "@models/globalBannerStats/entities/stats/stats6/Stats6FreeData.js";
import { Stats6FreeWinrateData } from "@models/globalBannerStats/entities/stats/stats6/Stats6FreeWinrateData.js";
import { Stats6WinrateData } from "@models/globalBannerStats/entities/stats/stats6/Stats6WinrateData.js";
import { GlobalTimelineData } from "@models/globalBannerStats/entities/timeline/GlobalTimelineData.js";
import { GlobalTimelineFreeData } from "@models/globalBannerStats/entities/timeline/GlobalTimelineFreeData.js";
import { GlobalBannerDataType } from "@models/globalBannerStats/GlobalBannerDataType.js";

export interface GlobalBannerDataSpecialV2 {
    type: GlobalBannerDataType.SPECIAL_V2;
    stats: {
        featured:
            & FeaturedStatsData
            & FeaturedFreeStatsData
            & FeaturedGuaranteedStatsData;
        overview:
            & OverviewStatsData
            & OverviewFreeStatsData
            & OverviewOroberylStatsData;
        stats6:
            & Stats6Data
            & Stats6FreeData
            & Stats6WinrateData
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