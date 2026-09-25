import { LinkUserPullsRequest } from "@api/contracts/userPulls/LinkUserPullsRequest.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

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
            item => rule.isValid(item.privateId),
            "privateId must be a string"
        );
    }
}