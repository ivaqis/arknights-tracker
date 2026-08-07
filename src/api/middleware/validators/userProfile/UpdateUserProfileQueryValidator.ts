import { UpdateUserProfileQuery } from "@api/contracts/userProfile/UpdateUserProfileQuery.js";
import { UsernameValidationRule } from "@models/validation/UsernameValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class UpdateUserProfileQueryValidator extends Validator<UpdateUserProfileQuery> {
    public constructor(item: UpdateUserProfileQuery) {
        super(item, UpdateUserProfileQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<UpdateUserProfileQuery>[] {
        return [
            this.getUidRule(),
        ];
    }

    private static getUidRule(): ValidationRule<UpdateUserProfileQuery> {
        const rule = new UsernameValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.uid),
            "uid must be a string matches \\w"
        );
    }
}