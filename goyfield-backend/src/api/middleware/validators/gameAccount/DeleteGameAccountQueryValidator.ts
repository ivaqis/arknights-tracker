import { DeleteGameAccountQuery } from "@api/contracts/gameAccount/DeleteGameAccountQuery.js";
import { GameUidValidationRule } from "@models/validation/GameUidValidationRule.js";
import { UsernameValidationRule } from "@models/validation/UsernameValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class DeleteGameAccountQueryValidator extends Validator<DeleteGameAccountQuery> {

    public constructor(item: DeleteGameAccountQuery) {
        super(item, DeleteGameAccountQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<DeleteGameAccountQuery>[] {
        return [
            this.getUidRule(),
            this.getGameUidRule(),
        ];
    }

    private static getUidRule(): ValidationRule<DeleteGameAccountQuery> {
        const rule = new UsernameValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.uid),
            "uid must be a string of digits"
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