import { PostImportRequest } from "@api/contracts/import/PostImportRequest";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class PostImportBodyValidator extends Validator<PostImportRequest> {

    public constructor(item: PostImportRequest) {
        super(item, PostImportBodyValidator.getRules());
    }

    private static getRules(): ValidationRule<PostImportRequest>[] {
        return [
            this.getProfileIdRule()
        ];
    }

    private static getProfileIdRule(): ValidationRule<PostImportRequest> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => item.privateId === null || rule.isValid(item.privateId),
            "privateId must be a string or null"
        );
    }
}