import { SyncProfileRequest } from "@api/contracts/syncProfile/SyncProfileRequest.js";
import { GameServerId } from "@models/GameServerId.js";
import { ListValidationRule } from "@models/validation/ListValidationRule.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

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
        const itemRule = new ValidationRule(item => typeof item === "string" && GameServerId.isServerId(item));
        const rule = new ListValidationRule(itemRule);

        return new ValidationRule(
            item => Array.isArray(item.serverIds) && 0 < item.serverIds.length && item.serverIds.length <= 2 && new Set(item.serverIds).size === item.serverIds.length && rule.isValid(item.serverIds),
            "serverIds must be an array of unique valid server ids; 0 < serverIds.length <= 2"
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