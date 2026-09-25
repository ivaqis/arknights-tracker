import { GlobalItemStatData } from "@models/globalBannerStats/entities/items/GlobalItemStatData.js";
import {
    GlobalPityDistributionData
} from "@models/globalBannerStats/entities/pityDistribution/GlobalPityDistributionData.js";
import { FeaturedStatsData } from "@models/globalBannerStats/entities/stats/featured/FeaturedStatsData.js";
import { OverviewFreeStatsData } from "@models/globalBannerStats/entities/stats/overview/OverviewFreeStatsData.js";
import {
    OverviewOroberylStatsData
} from "@models/globalBannerStats/entities/stats/overview/OverviewOroberylStatsData.js";
import { OverviewStatsData } from "@models/globalBannerStats/entities/stats/overview/OverviewStatsData.js";
import { Stats5Data } from "@models/globalBannerStats/entities/stats/stats5/Stats5Data.js";
import { Stats6Data } from "@models/globalBannerStats/entities/stats/stats6/Stats6Data.js";
import { Stats6WinrateData } from "@models/globalBannerStats/entities/stats/stats6/Stats6WinrateData.js";
import { GlobalTimelineData } from "@models/globalBannerStats/entities/timeline/GlobalTimelineData.js";
import { GlobalBannerDataType } from "@models/globalBannerStats/GlobalBannerDataType.js";

export interface GlobalBannerDataJointV1 {
    type: GlobalBannerDataType.JOINT_V1;
    stats: {
        featured: FeaturedStatsData;
        overview:
            & OverviewStatsData
            & OverviewFreeStatsData
            & OverviewOroberylStatsData;
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