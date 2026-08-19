import type { GlobalBannerDataType } from "$lib/api/globalBannerStats/contracts/GlobalBannerDataType";
import type { GlobalItemStatData } from "$lib/api/globalBannerStats/contracts/items/GlobalItemStatData";
import type {
    GlobalPityDistributionData
} from "$lib/api/globalBannerStats/contracts/pityDistribution/GlobalPityDistributionData";

export interface GlobalBannerDataGeneric {
    type: GlobalBannerDataType;
    stats: {
        featured?: {
            totalCount: number;
            ids: string[];
            freeCount?: number;
            guaranteedCount?: number;
        };
        overview: {
            totalUsers: number;
            totalPulls: number;
            freePulls?: number;
            oroberylSpent?: number;
            arsenalTicketsSpent?: number;
        };
        stats6: {
            totalCount: number;
            medianPity: number;
            totalRate: number;
            freeCount?: number;
            freeRate?: number;
            winrate?: number;
            freeWinrate?: number;
        };
        stats5: {
            totalCount: number;
            totalRate: number;
            freeCount?: number;
            freeRate?: number;
            medianPity?: number;
        };
    };
    timeline: {
        date: string;
        totalPulls: number;
        rate: number;
        freePulls?: number;
        freeRate?: number;
    }[];
    pityDistribution6: GlobalPityDistributionData[];
    pityDistribution5?: GlobalPityDistributionData[];
    items6: GlobalItemStatData[];
    items5: GlobalItemStatData[];
}