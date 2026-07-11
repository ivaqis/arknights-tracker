import { UpdateUserProfileQuery } from "@api/contracts/userProfile/UpdateUserProfileQuery";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class UpdateUserProfileQueryValidator extends Validator<UpdateUserProfileQuery> {
    public constructor(item: UpdateUserProfileQuery) {
        super(item, UpdateUserProfileQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<UpdateUserProfileQuery>[] {
        return [
            this.getFirebaseTokenRule(),
            this.getUidRule(),
            this.getGameUidRule()
        ];
    }

    private static getFirebaseTokenRule(): ValidationRule<UpdateUserProfileQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.firebaseToken),
            "firebaseToken must be a string"
        );
    }

    private static getUidRule(): ValidationRule<UpdateUserProfileQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.uid),
            "uid must be a string"
        );
    }

    private static getGameUidRule(): ValidationRule<UpdateUserProfileQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.gameUid),
            "gameUid must be a string"
        );
    }
}