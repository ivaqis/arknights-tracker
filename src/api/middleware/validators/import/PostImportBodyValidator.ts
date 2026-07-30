import { PostImportRequest } from "@api/contracts/import/PostImportRequest";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class PostImportBodyValidator extends Validator<PostImportRequest> {

    public constructor(item: PostImportRequest) {
        super(item, PostImportBodyValidator.getRules());
    }

    private static getRules(): ValidationRule<PostImportRequest>[] {
        return [];
    }

    private static getProfileIdRule(): ValidationRule<PostImportRequest> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => item.profileId === null || rule.isValid(item.profileId),
            "profileId must be a string or null"
        );
    }
}