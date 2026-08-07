import { SyncProfileQuery } from "@api/contracts/syncProfile/SyncProfileQuery.js";
import { UsernameValidationRule } from "@models/validation/UsernameValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class SyncProfileQueryValidator extends Validator<SyncProfileQuery> {

    public constructor(item: SyncProfileQuery) {
        super(item, SyncProfileQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<SyncProfileQuery>[] {
        return [
            this.getUidRule()
        ];
    }

    private static getUidRule(): ValidationRule<SyncProfileQuery> {
        const rule = new UsernameValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.uid),
            "uid must be a string matches \\w"
        );
    }
}