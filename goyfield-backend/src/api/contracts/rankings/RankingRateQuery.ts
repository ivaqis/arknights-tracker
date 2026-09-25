import { DbBannerType } from "@models/banners/DbBannerType.js";
import { BooleanString } from "@models/validation/BooleanStringValidationRule.js";

export interface RankingRateQuery {
    bannerType: DbBannerType | "all";
    totalPulls: string;
    total5Pulls: string;
    total6Pulls: string;
    total5050?: string;
    won5050?: string;
    countMe: BooleanString;
}