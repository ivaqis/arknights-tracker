import { UpdateUserProfileRequest } from "@api/contracts/userProfile/UpdateUserProfileRequest";
import { OptionalValidationRule } from "@models/validation/OptionalValidationRule";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class UpdateUserProfileBodyValidator extends Validator<UpdateUserProfileRequest> {
    public constructor(item: UpdateUserProfileRequest) {
        super(item, UpdateUserProfileBodyValidator.getRules());
    }

    private static getRules(): ValidationRule<UpdateUserProfileRequest>[] {
        return [
            this.getIsPrivateRule(),
            this.getAvatarIdRule(),
            this.getBackgroundIdRule()
        ];
    }

    private static getIsPrivateRule(): ValidationRule<UpdateUserProfileRequest> {
        return new ValidationRule(
            item => typeof item.isPrivate === "boolean" || typeof item.isPrivate === "undefined",
            "isPrivate must be true or false",
        );
    }

    private static getAvatarIdRule(): ValidationRule<UpdateUserProfileRequest> {
        const rule = new OptionalValidationRule(new StringValidationRule(true));

        return new ValidationRule(
            item => rule.isValid(item.avatarId),
            "avatarId must be a string",
        );
    }

    private static getBackgroundIdRule(): ValidationRule<UpdateUserProfileRequest> {
        const rule = new OptionalValidationRule(new StringValidationRule(true));

        return new ValidationRule(
            item => rule.isValid(item.backgroundId),
            "backgroundId must be a string",
        );
    }
}