import { GetProfileIdQuery } from "@api/contracts/import/GetProfileIdQuery";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

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