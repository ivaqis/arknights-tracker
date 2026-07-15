import { SyncProfileQuery } from "@api/contracts/syncProfile/SyncProfileQuery";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { UsernameValidationRule } from "@models/validation/UsernameValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class SyncProfileQueryValidator extends Validator<SyncProfileQuery> {

    public constructor(item: SyncProfileQuery) {
        super(item, SyncProfileQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<SyncProfileQuery>[] {
        return [
            this.getFirebaseTokenRule(),
            this.getUidRule()
        ];
    }

    private static getFirebaseTokenRule(): ValidationRule<SyncProfileQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.firebaseToken),
            "firebaseToken must be a string"
        );
    }

    private static getUidRule(): ValidationRule<SyncProfileQuery> {
        const rule = new UsernameValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.uid),
            "uid must be a string matches \\w"
        );
    }
}