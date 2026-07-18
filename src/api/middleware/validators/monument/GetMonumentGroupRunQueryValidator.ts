import { GetMonumentGroupRunQuery } from "@api/contracts/monument/GetMonumentGroupRunQuery";
import { BooleanStringValidationRule } from "@models/validation/BooleanStringValidationRule";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class GetMonumentGroupRunQueryValidator extends Validator<GetMonumentGroupRunQuery> {

    public constructor(item: GetMonumentGroupRunQuery) {
        super(item, GetMonumentGroupRunQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetMonumentGroupRunQuery>[] {
        return [
            this.getFirebaseTokenRule(),
            this.getGameUidRule(),
            this.getGroupIdRule(),
            this.getIsHardRule()
        ];
    }

    private static getFirebaseTokenRule(): ValidationRule<GetMonumentGroupRunQuery> {
        const rule = new StringValidationRule();

        return new ValidationRule(
            item => rule.isValid(item.firebaseToken),
            "firebaseToken must be a string"
        );
    }

    private static getGameUidRule(): ValidationRule<GetMonumentGroupRunQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.gameUid),
            "gameUid must be a string"
        );
    }

    private static getGroupIdRule(): ValidationRule<GetMonumentGroupRunQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.groupId),
            "groupId must be a string"
        );
    }

    private static getIsHardRule(): ValidationRule<GetMonumentGroupRunQuery> {
        const rule = new BooleanStringValidationRule();

        return new ValidationRule(
            item => rule.isValid(item.isHard),
            "isHard must be a boolean string"
        );
    }
}