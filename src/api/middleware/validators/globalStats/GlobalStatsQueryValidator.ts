import { GlobalStatsQuery } from "@api/contracts/globalStats/GlobalStatsQuery";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

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