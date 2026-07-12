import { CreateUserProfileRequest } from "@api/contracts/userProfile/CreateUserProfileRequest";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class CreateUserProfileBodyValidator extends Validator<CreateUserProfileRequest> {

    public constructor(item: CreateUserProfileRequest) {
        super(item, CreateUserProfileBodyValidator.getRules());
    }

    private static getRules(): ValidationRule<CreateUserProfileRequest>[] {
        return [
            this.getPublicUidRule(),
            this.getIsPrivateRule(),
            this.getBackgroundIdRule(),
            this.getAvatarIdRule()
        ];
    }

    private static getPublicUidRule(): ValidationRule<CreateUserProfileRequest> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.publicUid),
            "publicUid must be a string"
        );
    }

    private static getIsPrivateRule(): ValidationRule<CreateUserProfileRequest> {
        return new ValidationRule(
            item => typeof item.isPrivate === "boolean",
            "isPrivate must be a boolean"
        );
    }

    private static getAvatarIdRule(): ValidationRule<CreateUserProfileRequest> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.avatarId) || item.avatarId === null,
            "avatarId must be a string or null"
        );
    }

    private static getBackgroundIdRule(): ValidationRule<CreateUserProfileRequest> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.backgroundId) || item.backgroundId === null,
            "backgroundId must be a string or null"
        );
    }
}