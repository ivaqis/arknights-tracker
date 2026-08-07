import { GetUserProfileQuery } from "@api/contracts/userProfile/GetUserProfileQuery.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class GetUserProfileQueryValidator extends Validator<GetUserProfileQuery> {
    public constructor(item: GetUserProfileQuery) {
        super(item, GetUserProfileQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetUserProfileQuery>[] {
        return [
            this.getUidRule(),
        ];
    }

    private static getUidRule(): ValidationRule<GetUserProfileQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.uid),
            "uid must be a not-empty string matches \\w"
        );
    }
}