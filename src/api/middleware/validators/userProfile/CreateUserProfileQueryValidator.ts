import { CreateUserProfileQuery } from "@api/contracts/userProfile/CreateUserProfileQuery";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class CreateUserProfileQueryValidator extends Validator<CreateUserProfileQuery> {

    public constructor(item: CreateUserProfileQuery) {
        super(item, CreateUserProfileQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<CreateUserProfileQuery>[] {
        return [
            this.getFirebaseTokenRule()
        ];
    }

    private static getFirebaseTokenRule(): ValidationRule<CreateUserProfileQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.firebaseToken),
            "firebaseToken must be a string"
        );
    }
}