import { GetImportQuery } from "@api/contracts/import/GetImportQuery";
import { GameServerId } from "@models/GameServerId";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class GetImportQueryValidator extends Validator<GetImportQuery> {
    public static readonly SERVER_IDS_STR: string = GameServerId.getAll().join("|");
    public static readonly SERVER_IDS_REGEX: RegExp = new RegExp(`^${this.SERVER_IDS_STR}(?:,${this.SERVER_IDS_STR})?$`);
    public static readonly SERVER_IDS_INVALID_MSG: string = `serverIds must be ${this.SERVER_IDS_STR} separated by commas`;
    public static readonly LAST_PULL_TS_REGEX: RegExp = /^\d$/;

    public constructor(item: GetImportQuery) {
        super(item, GetImportQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetImportQuery>[] {
        return [
            this.getTokenRule(),
            this.getServerIdsRule(),
            this.getLastPullTsRule()
        ];
    }

    private static getTokenRule(): ValidationRule<GetImportQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.token),
            "token must be a string"
        );
    }

    private static getServerIdsRule(): ValidationRule<GetImportQuery> {
        return new ValidationRule(
            item => typeof item.serverIds === "string" && this.SERVER_IDS_REGEX.test(item.serverIds),
            this.SERVER_IDS_INVALID_MSG
        );
    }

    private static getLastPullTsRule(): ValidationRule<GetImportQuery> {
        return new ValidationRule(
            item => typeof item.lastPullTs === "string" && this.LAST_PULL_TS_REGEX.test(item.lastPullTs),
            "lastPullTs must be a string of digits"
        );
    }
}