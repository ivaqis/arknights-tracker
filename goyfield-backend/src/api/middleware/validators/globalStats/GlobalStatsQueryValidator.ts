import { GlobalStatsQuery } from "@api/contracts/globalStats/GlobalStatsQuery.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class GlobalStatsQueryValidator extends Validator<GlobalStatsQuery> {

    public constructor(item: GlobalStatsQuery) {
        super(item, GlobalStatsQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GlobalStatsQuery>[] {
        return [
            this.getBannerIdRule()
        ];
    }

    private static getBannerIdRule(): ValidationRule<GlobalStatsQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.bannerId),
            "bannerId must be a string"
        );
    }
}