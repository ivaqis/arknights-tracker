import { UserProfileQuery } from "@api/contracts/userProfile/UserProfileQuery";
import { OptionalValidationRule } from "@models/validation/OptionalValidationRule";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class UserProfileQueryValidator extends Validator<UserProfileQuery> {
    public constructor(item: UserProfileQuery) {
        super(item, UserProfileQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<UserProfileQuery>[] {
        return [
            this.getUidRule(),
            this.getFirebaseUidRule()
        ];
    }

    private static getUidRule(): ValidationRule<UserProfileQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.uid),
            "uid must be a string"
        );
    }

    private static getFirebaseUidRule(): ValidationRule<UserProfileQuery> {
        const rule = new OptionalValidationRule(new StringValidationRule(true));

        return new ValidationRule(
            item => rule.isValid(item.firebaseUid),
            "firebaseUid must be a string or undefined"
        );
    }
}