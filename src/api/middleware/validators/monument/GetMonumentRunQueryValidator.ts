import { GetMonumentRunQuery } from "@api/contracts/monument/GetMonumentRunQuery";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class GetMonumentRunQueryValidator extends Validator<GetMonumentRunQuery> {

    public constructor(item: GetMonumentRunQuery) {
        super(item, GetMonumentRunQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetMonumentRunQuery>[] {
        return [
            this.getRecordIdRule()
        ];
    }

    private static getRecordIdRule(): ValidationRule<GetMonumentRunQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.recordId),
            "recordId must be a string",
        )
    }
}