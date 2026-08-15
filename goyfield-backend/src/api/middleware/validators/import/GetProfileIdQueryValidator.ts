import { GetProfileIdQuery } from "@api/contracts/import/GetProfileIdQuery.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class GetProfileIdQueryValidator extends Validator<GetProfileIdQuery> {

    public constructor(item: GetProfileIdQuery) {
        super(item, GetProfileIdQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetProfileIdQuery>[] {
        return [
            this.getPrivateIdRule()
        ];
    }

    private static getPrivateIdRule(): ValidationRule<GetProfileIdQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.privateId),
            "privateId must be a string"
        );
    }
}