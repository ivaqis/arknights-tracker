import { SyncImportQuery } from "@api/contracts/import/SyncImportQuery";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";
import { JWT_REGEX } from "@utils/validationUtils";

export class SyncImportQueryValidator extends Validator<SyncImportQuery> {

    public constructor(item: SyncImportQuery) {
        super(item, SyncImportQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<SyncImportQuery>[] {
        return [
            this.getTokenRule()
        ];
    }

    private static getTokenRule(): ValidationRule<SyncImportQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.token) && JWT_REGEX.test(item.token),
            "token must be a string matches JWT signature"
        );
    }
}