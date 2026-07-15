import { SyncProfileRequest } from "@api/contracts/syncProfile/SyncProfileRequest";
import { ListValidationRule } from "@models/validation/ListValidationRule";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class SyncProfileBodyValidator extends Validator<SyncProfileRequest> {

    public constructor(item: SyncProfileRequest) {
        super(item, SyncProfileBodyValidator.getRules());
    }

    private static getRules(): ValidationRule<SyncProfileRequest>[] {
        return [
            this.getServerIdsRule(),
            this.getTokenRule()
        ];
    }

    private static getServerIdsRule(): ValidationRule<SyncProfileRequest> {
        const rule = new ListValidationRule(new StringValidationRule(true));

        return new ValidationRule(
            item => rule.isValid(item.serverIds) && item.serverIds.length > 0 && item.serverIds.length <= 2,
            "serverIds must be an array of strings"
        );
    }

    public static getTokenRule(): ValidationRule<SyncProfileRequest> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.token),
            "token must be a string"
        );
    }
}