import { GetWarEchoesGroupRunQuery } from "@api/contracts/warEchoes/GetWarEchoesGroupRunQuery.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class GetWarEchoesGroupRunQueryValidator extends Validator<GetWarEchoesGroupRunQuery> {

    public constructor(item: GetWarEchoesGroupRunQuery) {
        super(item, GetWarEchoesGroupRunQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetWarEchoesGroupRunQuery>[] {
        return [
            this.getGroupIdRule()
        ];
    }

    private static getGroupIdRule(): ValidationRule<GetWarEchoesGroupRunQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.groupId),
            "groupId must be a string",
        );
    }
}
