import { SyncImportRequest } from "@api/contracts/import/SyncImportRequest.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class SyncImportBodyValidator extends Validator<SyncImportRequest> {

    public constructor(item: SyncImportRequest) {
        super(item, SyncImportBodyValidator.getRules());
    }

    private static getRules(): ValidationRule<SyncImportRequest>[] {
        return [
            this.getConfirmRule()
        ];
    }

    private static getConfirmRule(): ValidationRule<SyncImportRequest> {
        return new ValidationRule(
            item => typeof item.confirm === "boolean",
            "confirm must be a boolean"
        );
    }
}