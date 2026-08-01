import { RankingRateQuery } from "@api/contracts/rankings/RankingRateQuery";
import { DbBannerType } from "@models/banners/DbBannerType";
import { BooleanStringValidationRule } from "@models/validation/BooleanStringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class RankingRateQueryValidator extends Validator<RankingRateQuery> {
    private static readonly NUMBER_REGEX = /^\d+$/;

    public constructor(item: RankingRateQuery) {
        super(item, RankingRateQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<RankingRateQuery>[] {
        return [
            this.getBannerTypeRule(),
            this.getTotalPullsRule(),
            this.getTotal5050Rule(),
            this.getWon5050Rule(),
            this.get5050Rule(),
            this.getTotal5PullsRule(),
            this.getTotal6PullsRule(),
            this.getCountMeRule()
        ];
    }

    private static getBannerTypeRule(): ValidationRule<RankingRateQuery> {
        return new ValidationRule(
            item => typeof item.bannerType === "string"
                && (DbBannerType.isDbBannerType(item.bannerType) || item.bannerType === "all"),
            "bannerType must be DbBannerType or 'all'"
        );
    }

    private static getTotalPullsRule(): ValidationRule<RankingRateQuery> {
        return new ValidationRule(
            item => typeof item.totalPulls === "string"
                && this.NUMBER_REGEX.test(item.totalPulls),
            "totalPulls must be a number"
        );
    }

    private static getTotal5050Rule(): ValidationRule<RankingRateQuery> {
        return new ValidationRule(
            item => typeof item.total5050 === "string"
                && (item.total5050 === "null" || this.NUMBER_REGEX.test(item.total5050)),
            "total5050 must be a number or null"
        );
    }

    private static getWon5050Rule(): ValidationRule<RankingRateQuery> {
        return new ValidationRule(
            item => typeof item.won5050 === "string"
                && (item.won5050 === "null" || this.NUMBER_REGEX.test(item.won5050)),
            "won5050 must be a number or null"
        );
    }

    private static get5050Rule(): ValidationRule<RankingRateQuery> {
        return new ValidationRule(
            item => item.total5050 === "null" && item.won5050 === "null"
                || item.total5050 !== "null" && item.won5050 !== "null",
            "if total5050 or won5050 provided, won5050 and total5050 both must be provided"
        );
    }

    private static getTotal5PullsRule(): ValidationRule<RankingRateQuery> {
        return new ValidationRule(
            item => typeof item.total5Pulls === "string"
                && (item.total5Pulls === "null" || this.NUMBER_REGEX.test(item.total5Pulls)),
            "total5Pulls must be a number or null"
        );
    }

    private static getTotal6PullsRule(): ValidationRule<RankingRateQuery> {
        return new ValidationRule(
            item => typeof item.total6Pulls === "string"
                && (item.total6Pulls === "null" || this.NUMBER_REGEX.test(item.total6Pulls)),
            "total6Pulls must be a number or null"
        );
    }

    private static getCountMeRule(): ValidationRule<RankingRateQuery> {
        const rule = new BooleanStringValidationRule();

        return new ValidationRule(
            item => rule.isValid(item.countMe),
            "countMe must be a boolean"
        );
    }
}