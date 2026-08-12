import { UserExistQuery } from "@api/contracts/userExist/UserExistQuery.js";
import { UsernameValidationRule } from "@models/validation/UsernameValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class UserExistQueryValidator extends Validator<UserExistQuery> {

    public constructor(item: UserExistQuery) {
        super(item, UserExistQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<UserExistQuery>[] {
        return [
            this.getUidRule()
        ];
    }

    private static getUidRule(): ValidationRule<UserExistQuery> {
        const rule = new UsernameValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.uid),
            "uid must be a string matches \\w"
        );
    }
}