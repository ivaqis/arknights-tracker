import { GetMonumentGroupListQuery } from "@api/contracts/monument/GetMonumentGroupListQuery";
import { GetMonumentListQuery } from "@api/contracts/monument/GetMonumentListQuery";
import { GetMonumentListQueryValidator } from "@api/middleware/validators/monument/GetMonumentListQueryValidator";
import { GameServerId } from "@models/GameServerId";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";
import { BooleanStringValidationRule } from "@models/validation/BooleanStringValidationRule";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class GetMonumentGroupListQueryValidator extends Validator<GetMonumentGroupListQuery> {
    private static readonly recordsOnPageSet = new Set(GetMonumentListQueryValidator.recordsOnPage);

    public constructor(item: GetMonumentGroupListQuery) {
        super(item, GetMonumentGroupListQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetMonumentGroupListQuery>[] {
        return [
            this.getGroupIdRule(),
            this.getIsHardRule(),
            this.getSortFieldRule(),
            this.getSortOrderRule(),
            this.getServerIdRule(),
            this.getRecordsOnPageRule(),
            this.getPageRule(),
            this.getCharsFilterRule(),
            this.getCharCountFilterRule()
        ];
    }

    private static getCharsFilterRule(): ValidationRule<GetMonumentGroupListQuery> {
        return new ValidationRule(
            item => typeof item.charsFilter === "string" && (item.charsFilter === "" || GetMonumentListQueryValidator.FILTER_LIST_REGEX.test(item.charsFilter)),
            "charsFilter must be list of char ids separated by commas"
        );
    }

    private static getCharCountFilterRule(): ValidationRule<GetMonumentGroupListQuery> {
        return new ValidationRule(
            item => typeof item.charCountFilter === "string" && (item.charCountFilter === "" || GetMonumentListQueryValidator.COUNT_FILTER_LIST_REGEX.test(item.charCountFilter)),
            "charCountFilter must be list of numbers separated by commas"
        );
    }

    private static getGroupIdRule(): ValidationRule<GetMonumentGroupListQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.groupId),
            "groupId must be a string"
        );
    }

    private static getIsHardRule(): ValidationRule<GetMonumentGroupListQuery> {
        const rule = new BooleanStringValidationRule();

        return new ValidationRule(
            item => rule.isValid(item.isHard),
            "isHard must be a boolean"
        );
    }

    private static getSortFieldRule(): ValidationRule<GetMonumentGroupListQuery> {
        return new ValidationRule(
            item => typeof item.sortField === "string" && MonumentLeaderboardSortField.isSortField(item.sortField),
            "sortField must be 'level' or 'time'"
        );
    }

    private static getSortOrderRule(): ValidationRule<GetMonumentGroupListQuery> {
        return new ValidationRule(
            item => typeof item.sortOrder === "string" && SortOrder.isSortOrder(item.sortOrder),
            "sortOrder must be 'asc' or 'desc'"
        );
    }

    private static getServerIdRule(): ValidationRule<GetMonumentGroupListQuery> {
        return new ValidationRule(
            item => typeof item.serverId === "string" && (GameServerId.isServerId(item.serverId) || item.serverId === "all"),
            "serverId must be '2' or '3' or 'all'"
        );
    }

    private static getPageRule(): ValidationRule<GetMonumentGroupListQuery> {
        return new ValidationRule(
            item => typeof item.page === "string" && !isNaN(parseInt(item.page, 10)) && parseInt(item.page, 10) > 0,
            "page must be a natural number"
        );
    }

    private static getRecordsOnPageRule(): ValidationRule<GetMonumentGroupListQuery> {
        return new ValidationRule(
            item => typeof item.recordsOnPage === "string" && this.recordsOnPageSet.has(item.recordsOnPage),
            "recordsOnPage must be 40 or 60 or 80 or 100"
        );
    }
}