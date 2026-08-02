import { LinkUserPullsRequest } from "@api/contracts/userPulls/LinkUserPullsRequest";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class LinkUserPullsBodyValidator extends Validator<LinkUserPullsRequest> {

    public constructor(item: LinkUserPullsRequest) {
        super(item, LinkUserPullsBodyValidator.getRules());
    }

    private static getRules(): ValidationRule<LinkUserPullsRequest>[] {
        return [
            this.getProfileIdRule()
        ];
    }

    private static getProfileIdRule(): ValidationRule<LinkUserPullsRequest> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.profileId),
            "profileId must be a string"
        );
    }
}