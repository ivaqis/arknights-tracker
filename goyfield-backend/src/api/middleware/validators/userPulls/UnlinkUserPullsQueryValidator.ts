import { UnlinkUserPullsQuery } from "@api/contracts/userPulls/UnlinkUserPullsQuery.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class UnlinkUserPullsQueryValidator extends Validator<UnlinkUserPullsQuery> {

    public constructor(item: UnlinkUserPullsQuery) {
        super(item, UnlinkUserPullsQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<UnlinkUserPullsQuery>[] {
        return [
            this.getUidRule()
        ];
    }

    private static getUidRule(): ValidationRule<UnlinkUserPullsQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.gameUid),
            "gameUid must be a string"
        );
    }
}