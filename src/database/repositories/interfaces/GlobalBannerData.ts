import { GlobalBannerTimelineRecord } from "@database/records/GlobalBannerTimelineRecord";
import { GlobalItemStatsRecord } from "@database/records/GlobalItemStatsRecord";
import { GlobalPityDistributionRecord } from "@database/records/GlobalPityDistributionRecord";

export interface GlobalBannerData {
    timeline: GlobalBannerTimelineRecord[],
    pityDistribution: GlobalPityDistributionRecord[],
    itemStats: GlobalItemStatsRecord[]
}