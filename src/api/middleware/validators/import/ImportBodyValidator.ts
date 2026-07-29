import { ImportRequest } from "@api/contracts/import/ImportRequest";
import { BannerType } from "@models/banners/BannerType";
import { GameServerId } from "@models/GameServerId";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class ImportBodyValidator extends Validator<ImportRequest> {
    public static readonly NUMBER_REGEX = /^\d+$/;

    public constructor(item: ImportRequest) {
        super(item, ImportBodyValidator.getRules());
    }

    private static getRules(): ValidationRule<ImportRequest>[] {
        return [
            this.getIdRule(),
            this.getTokenRule(),
            this.getServerIdsRule(),
            this.getLastPullTsRule(),
            this.getShareRule()
        ];
    }

    private static getIdRule(): ValidationRule<ImportRequest> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.id) || item.id === null,
            "id must be a string or null"
        );
    }

    private static getTokenRule(): ValidationRule<ImportRequest> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.token),
            "token must be a string"
        );
    }

    private static getServerIdsRule(): ValidationRule<ImportRequest> {
        return new ValidationRule(
            item => Array.isArray(item.serverIds)
                && 0 < item.serverIds.length && item.serverIds.length <=2
                && new Set(item.serverIds).size === item.serverIds.length
                && item.serverIds.every(i => GameServerId.isServerId(i)),
            "serverIds must be a not-empty array of '2' or '3'"
        );
    }

    private static getLastPullTsRule(): ValidationRule<ImportRequest> {
        return new ValidationRule(
            item => typeof item.lastPullTs === "number" && item.lastPullTs >= 0,
            "lastPullTs must be a number >= 0"
        );
    }

    private static getShareRule(): ValidationRule<ImportRequest> {
        return new ValidationRule(
            item => typeof item.share === "boolean",
            "share must be a boolean"
        );
    }
}