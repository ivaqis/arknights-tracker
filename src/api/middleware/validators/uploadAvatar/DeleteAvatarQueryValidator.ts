import { DeleteAvatarQuery } from "@api/contracts/uploadAvatar/DeleteAvatarQuery";
import { UsernameValidationRule } from "@models/validation/UsernameValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class DeleteAvatarQueryValidator extends Validator<DeleteAvatarQuery> {

    public constructor(item: DeleteAvatarQuery) {
        super(item, DeleteAvatarQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<DeleteAvatarQuery>[] {
        return [
            this.getUidRule()
        ];
    }

    private static getUidRule(): ValidationRule<DeleteAvatarQuery> {
        const rule = new UsernameValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.uid),
            "uid must be a string matches \\w"
        );
    }
}