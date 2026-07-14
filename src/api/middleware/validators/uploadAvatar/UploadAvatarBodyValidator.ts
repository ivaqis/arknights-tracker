import { UploadAvatarRequest } from "@api/contracts/uploadAvatar/UploadAvatarRequest";
import { OptionalValidationRule } from "@models/validation/OptionalValidationRule";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class UploadAvatarBodyValidator extends Validator<UploadAvatarRequest> {
    public constructor(item: UploadAvatarRequest) {
        super(item, UploadAvatarBodyValidator.getRules());
    }

    private static getRules(): ValidationRule<UploadAvatarRequest>[] {
        return [
            this.getImageRule(),
            this.getFilenameRule()
        ];
    }

    private static getImageRule(): ValidationRule<UploadAvatarRequest> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.image),
            "image must be a string"
        );
    }

    private static getFilenameRule(): ValidationRule<UploadAvatarRequest> {
        const rule = new OptionalValidationRule(new StringValidationRule(true));

        return new ValidationRule(
            item => rule.isValid(item.filename),
            "filename must be a string"
        );
    }
}