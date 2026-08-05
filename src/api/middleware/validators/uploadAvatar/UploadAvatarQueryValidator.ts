import { UploadAvatarQuery } from "@api/contracts/uploadAvatar/UploadAvatarQuery";
import { UsernameValidationRule } from "@models/validation/UsernameValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class UploadAvatarQueryValidator extends Validator<UploadAvatarQuery> {

    public constructor(item: UploadAvatarQuery) {
        super(item, UploadAvatarQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<UploadAvatarQuery>[] {
        return [
            this.getUidRule()
        ];
    }

    private static getUidRule(): ValidationRule<UploadAvatarQuery> {
        const rule = new UsernameValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.uid),
            "uid must be a string matches \\w"
        );
    }
}