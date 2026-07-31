import { DbBannerType } from "@models/banners/DbBannerType";

export interface RankingDataQuery {
    bannerType: DbBannerType | "all";
    totalPulls: string;
    total5050: string;
    won5050: string;
    total5Pulls: string;
    total6Pulls: string;
}