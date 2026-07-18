import { GetMonumentRunQuery } from "@api/contracts/monument/GetMonumentRunQuery";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class GetMonumentRunQueryValidator extends Validator<GetMonumentRunQuery> {

    public constructor(item: GetMonumentRunQuery) {
        super(item, GetMonumentRunQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetMonumentRunQuery>[] {
        return [
            this.getFirebaseTokenRule(),
            this.getGameUidRule(),
            this.getDungeonIdRule()
        ];
    }

    private static getFirebaseTokenRule(): ValidationRule<GetMonumentRunQuery> {
        const rule = new StringValidationRule();

        return new ValidationRule(
            item => rule.isValid(item.firebaseToken),
            "firebaseToken must be a string",
        );
    }

    private static getGameUidRule(): ValidationRule<GetMonumentRunQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.gameUid),
            "gameUid must be a string",
        );
    }

    private static getDungeonIdRule(): ValidationRule<GetMonumentRunQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.dungeonId),
            "dungeonId must be a string",
        );
    }
}