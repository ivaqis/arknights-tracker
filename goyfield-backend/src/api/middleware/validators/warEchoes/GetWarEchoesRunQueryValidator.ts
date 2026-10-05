import { GetWarEchoesRunQuery } from "@api/contracts/warEchoes/GetWarEchoesRunQuery.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class GetWarEchoesRunQueryValidator extends Validator<GetWarEchoesRunQuery> {

    public constructor(item: GetWarEchoesRunQuery) {
        super(item, GetWarEchoesRunQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetWarEchoesRunQuery>[] {
        return [
            this.getRecordIdRule()
        ];
    }

    private static getRecordIdRule(): ValidationRule<GetWarEchoesRunQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.recordId),
            "recordId must be a string"
        );
    }
}
