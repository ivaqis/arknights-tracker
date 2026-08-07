import { DeleteUserProfileQuery } from "@api/contracts/userProfile/DeleteUserProfileQuery.js";
import { UsernameValidationRule } from "@models/validation/UsernameValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class DeleteUserProfileQueryValidator extends Validator<DeleteUserProfileQuery> {

    public constructor(item: DeleteUserProfileQuery) {
        super(item, DeleteUserProfileQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<DeleteUserProfileQuery>[] {
        return [
            this.getUidRule()
        ];
    }

    private static getUidRule(): ValidationRule<DeleteUserProfileQuery> {
        const rule = new UsernameValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.uid),
            "uid must be a string matches \\w"
        );
    }
}