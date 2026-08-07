import { GlobalItemData } from "@models/globalBannerStats/GlobalItemData.js";
import { GlobalPityData } from "@models/globalBannerStats/GlobalPityData.js";
import { GlobalTimelineData } from "@models/globalBannerStats/GlobalTimelineData.js";

export interface GlobalStatsResponse {
    bannerId: string;
    stats: {
        totalUsers: number;
        totalPulls: number;
        total6: number;
        total5: number;
        total5050: number;
        totalWon5050: number;
        totalLimited: number;
        freePulls: number;
        free6: number;
        free5: number;
        freeWon5050: number;
        oroberylSpent: number;
        medianPity6: number;
        medianPity5: number;
    };
    timeline: GlobalTimelineData[];
    pityDistribution6: GlobalPityData[]; // zero pity is free
    pityDistribution5: GlobalPityData[]; // zero pity is free
    items6: GlobalItemData[];
    items5: GlobalItemData[];
}