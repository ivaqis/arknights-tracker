import { UnlinkUserPullsQuery } from "@api/contracts/userPulls/UnlinkUserPullsQuery";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { UsernameValidationRule } from "@models/validation/UsernameValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class UnlinkUserPullsQueryValidator extends Validator<UnlinkUserPullsQuery> {

    public constructor(item: UnlinkUserPullsQuery) {
        super(item, UnlinkUserPullsQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<UnlinkUserPullsQuery>[] {
        return [
            this.getFirebaseTokenRule(),
            this.getUidRule()
        ];
    }

    private static getFirebaseTokenRule(): ValidationRule<UnlinkUserPullsQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.firebaseToken),
            "firebaseToken must be a string"
        );
    }

    private static getUidRule(): ValidationRule<UnlinkUserPullsQuery> {
        const rule = new UsernameValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.uid),
            "uid must be a string matches \\w"
        );
    }
}