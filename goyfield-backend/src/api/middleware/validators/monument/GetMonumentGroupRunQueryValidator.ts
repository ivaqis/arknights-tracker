import { GetMonumentGroupRunQuery } from "@api/contracts/monument/GetMonumentGroupRunQuery.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class GetMonumentGroupRunQueryValidator extends Validator<GetMonumentGroupRunQuery> {

    public constructor(item: GetMonumentGroupRunQuery) {
        super(item, GetMonumentGroupRunQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetMonumentGroupRunQuery>[] {
        return [
            this.getGroupIdRule(),
        ];
    }

    private static getGroupIdRule(): ValidationRule<GetMonumentGroupRunQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.groupId),
            "groupId must be a string"
        );
    }
}