import { DbBannerType } from "@models/banners/DbBannerType";

export interface RankingRateQuery {
    bannerType: DbBannerType | "all";
    totalPulls: string;
    total5050: string | "null";
    won5050: string | "null";
    total5Pulls: string | "null";
    total6Pulls: string | "null";
}