import { DeleteGameAccountQuery } from "@api/contracts/gameAccount/DeleteGameAccountQuery";
import { GameUidValidationRule } from "@models/validation/GameUidValidationRule";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { UsernameValidationRule } from "@models/validation/UsernameValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class DeleteGameAccountQueryValidator extends Validator<DeleteGameAccountQuery> {

    public constructor(item: DeleteGameAccountQuery) {
        super(item, DeleteGameAccountQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<DeleteGameAccountQuery>[] {
        return [
            this.getUidRule(),
            this.getGameUidRule(),
            this.getFirebaseTokenRule()
        ];
    }

    private static getUidRule(): ValidationRule<DeleteGameAccountQuery> {
        const rule = new UsernameValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.uid),
            "uid must be a string of digits"
        );
    }

    private static getFirebaseTokenRule(): ValidationRule<DeleteGameAccountQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.firebaseToken),
            "firebaseToken must be a string"
        );
    }

    private static getGameUidRule(): ValidationRule<DeleteGameAccountQuery> {
        const rule = new GameUidValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.gameUid),
            "gameUid must be a string matches \\w"
        );
    }
}