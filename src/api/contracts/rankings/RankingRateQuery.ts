import { DbBannerType } from "@models/banners/DbBannerType";
import { BooleanString } from "@models/validation/BooleanStringValidationRule";

export interface RankingRateQuery {
    bannerType: DbBannerType | "all";
    totalPulls: string;
    total5Pulls: string;
    total6Pulls: string;
    total5050: string | "null";
    won5050: string | "null";
    countMe: BooleanString;
}