import { PostImportQuery } from "@api/contracts/import/PostImportQuery.js";
import { GetImportQueryValidator } from "@api/middleware/validators/import/GetImportQueryValidator.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class PostImportQueryValidator extends Validator<PostImportQuery> {

    public constructor(item: PostImportQuery) {
        super(item, PostImportQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<PostImportQuery>[] {
        return [
            this.getTokenRule(),
            this.getServerIdsRule()
        ];
    }

    private static getTokenRule(): ValidationRule<PostImportQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.token),
            "token must be a string"
        );
    }

    private static getServerIdsRule(): ValidationRule<PostImportQuery> {
        return new ValidationRule(
            item => typeof item.serverIds === "string" && GetImportQueryValidator.SERVER_IDS_REGEX.test(item.serverIds),
            GetImportQueryValidator.SERVER_IDS_INVALID_MSG
        );
    }
}