import { GlobalBannerTimelineRecord } from "@database/records/GlobalBannerTimelineRecord.js";
import { GlobalItemStatsRecord } from "@database/records/GlobalItemStatsRecord.js";
import { GlobalPityDistributionRecord } from "@database/records/GlobalPityDistributionRecord.js";

export interface GlobalBannerData {
    timeline: GlobalBannerTimelineRecord[],
    pityDistribution: GlobalPityDistributionRecord[],
    itemStats: GlobalItemStatsRecord[]
}