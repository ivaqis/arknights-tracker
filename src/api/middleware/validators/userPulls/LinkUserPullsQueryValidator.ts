import { LinkUserPullsQuery } from "@api/contracts/userPulls/LinkUserPullsQuery";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

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