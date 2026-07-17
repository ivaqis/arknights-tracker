import { UserListQuery } from "@api/contracts/userList/UserListQuery";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class UserListQueryValidator extends Validator<UserListQuery> {

    public constructor(item: UserListQuery) {
        super(item, UserListQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<UserListQuery>[] {
        return [
            this.getFirebaseTokenRule()
        ];
    }

    private static getFirebaseTokenRule(): ValidationRule<UserListQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.firebaseToken),
            "firebaseToken must be a string",
        );
    }
}