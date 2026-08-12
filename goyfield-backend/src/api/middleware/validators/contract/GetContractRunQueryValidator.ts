import { GetContractRunQuery } from "@api/contracts/contract/GetContractRunQuery.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class GetContractRunQueryValidator extends Validator<GetContractRunQuery> {

    public constructor(item: GetContractRunQuery) {
        super(item, GetContractRunQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetContractRunQuery>[] {
        return [
            this.getRecordIdRule()
        ];
    }

    private static getRecordIdRule(): ValidationRule<GetContractRunQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.recordId),
            "recordId must be a string"
        );
    }
}