import { GlobalItemStatData } from "@models/globalBannerStats/entities/items/GlobalItemStatData.js";
import { GlobalPityDistributionData } from "@models/globalBannerStats/entities/pityDistribution/GlobalPityDistributionData.js";
import { GlobalTimelineData } from "@models/globalBannerStats/entities/timeline/GlobalTimelineData.js";
import { OverviewStatsData } from "@models/globalBannerStats/entities/stats/overview/OverviewStatsData.js";
import { Stats5Data } from "@models/globalBannerStats/entities/stats/stats5/Stats5Data.js";
import { Stats6Data } from "@models/globalBannerStats/entities/stats/stats6/Stats6Data.js";
import { GlobalBannerDataType } from "@models/globalBannerStats/GlobalBannerDataType.js";

export interface GlobalBannerDataBeginner {
    type: GlobalBannerDataType.BEGINNER;
    stats: {
        overview: OverviewStatsData;
        stats6: Stats6Data;
        stats5: Stats5Data;
    };
    timeline: GlobalTimelineData[];
    pityDistribution6: GlobalPityDistributionData[];
    items6: GlobalItemStatData[];
    items5: GlobalItemStatData[];
}