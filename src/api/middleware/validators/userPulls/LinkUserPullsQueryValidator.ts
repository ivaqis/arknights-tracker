import { LinkUserPullsQuery } from "@api/contracts/userPulls/LinkUserPullsQuery.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class LinkUserPullsQueryValidator extends Validator<LinkUserPullsQuery> {

    public constructor(item: LinkUserPullsQuery) {
        super(item, LinkUserPullsQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<LinkUserPullsQuery>[] {
        return [
            this.getUidRule()
        ];
    }

    private static getUidRule(): ValidationRule<LinkUserPullsQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.gameUid),
            "gameUid must be a string"
        );
    }
}