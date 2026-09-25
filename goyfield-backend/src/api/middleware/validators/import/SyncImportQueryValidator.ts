import { SyncImportQuery } from "@api/contracts/import/SyncImportQuery.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";
import { JWT_REGEX } from "@utils/validationUtils.js";

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