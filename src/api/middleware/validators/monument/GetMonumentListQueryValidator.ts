import { GetMonumentListQuery } from "@api/contracts/monument/GetMonumentListQuery";
import { GameServerId } from "@models/GameServerId";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class GetMonumentListQueryValidator extends Validator<GetMonumentListQuery> {
    public static readonly recordsOnPage = ["40", "60", "80", "100"] as const;
    public static readonly FILTER_LIST_REGEX = /^[a-zA-Z0-9_,]+$/;
    public static readonly COUNT_FILTER_LIST_REGEX = /^[0-9,]+$/;

    private static readonly recordsOnPageSet = new Set(this.recordsOnPage);

    public constructor(item: GetMonumentListQuery) {
        super(item, GetMonumentListQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetMonumentListQuery>[] {
        return [
            this.getDungeonIdRule(),
            this.getSortFieldRule(),
            this.getSortOrderRule(),
            this.getServerIdRule(),
            this.getPageRule(),
            this.getRecordsOnPageRule(),
            this.getCharsFilterRule(),
            this.getCharCountFilterRule()
        ];
    }

    private static getCharsFilterRule(): ValidationRule<GetMonumentListQuery> {
        return new ValidationRule(
            item => typeof item.charsFilter === "string" && (item.charsFilter === "" || this.FILTER_LIST_REGEX.test(item.charsFilter)),
            "charsFilter must be list of char ids separated by commas"
        );
    }

    private static getCharCountFilterRule(): ValidationRule<GetMonumentListQuery> {
        return new ValidationRule(
            item => typeof item.charCountFilter === "string" && (item.charCountFilter === "" || this.COUNT_FILTER_LIST_REGEX.test(item.charCountFilter)),
            "charCountFilter must be list of numbers separated by commas"
        );
    }

    private static getDungeonIdRule(): ValidationRule<GetMonumentListQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.dungeonId),
            "dungeonId must be a string"
        );
    }

    private static getSortFieldRule(): ValidationRule<GetMonumentListQuery> {
        return new ValidationRule(
            item => typeof item.sortField === "string" && MonumentLeaderboardSortField.isSortField(item.sortField),
            "sortField must be 'level' or 'time'"
        );
    }

    private static getSortOrderRule(): ValidationRule<GetMonumentListQuery> {
        return new ValidationRule(
            item => typeof item.sortOrder === "string" && SortOrder.isSortOrder(item.sortOrder),
            "sortOrder must be 'asc' or 'desc'"
        );
    }

    private static getServerIdRule(): ValidationRule<GetMonumentListQuery> {
        return new ValidationRule(
            item => typeof item.serverId === "string" && (GameServerId.isServerId(item.serverId) || item.serverId === "all"),
            "serverId must be '2' or '3' or 'all'"
        );
    }

    private static getPageRule(): ValidationRule<GetMonumentListQuery> {
        return new ValidationRule(
            item => typeof item.page === "string" && !isNaN(parseInt(item.page, 10)) && parseInt(item.page, 10) > 0,
            "page must be a natural number"
        );
    }

    private static getRecordsOnPageRule(): ValidationRule<GetMonumentListQuery> {
        return new ValidationRule(
            item => typeof item.recordsOnPage === "string" && this.recordsOnPageSet.has(item.recordsOnPage),
            "recordsOnPage must be 40 or 60 or 80 or 100"
        );
    }
}