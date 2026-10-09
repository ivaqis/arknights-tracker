import { GetWarEchoesListQuery } from "@api/contracts/warEchoes/GetWarEchoesListQuery.js";
import { GameServerId } from "@models/GameServerId.js";
import { WarEchoesLeaderboardSortField } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class GetWarEchoesListQueryValidator extends Validator<GetWarEchoesListQuery> {
    public static readonly recordsOnPage = ["10", "20", "40", "50", "60", "80", "100"] as const;
    public static readonly FILTER_LIST_REGEX = /^[a-zA-Z0-9_,]+$/;
    public static readonly COUNT_FILTER_LIST_REGEX = /^[0-9,]+$/;

    private static readonly recordsOnPageSet = new Set(this.recordsOnPage);

    public constructor(item: GetWarEchoesListQuery) {
        super(item, GetWarEchoesListQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetWarEchoesListQuery>[] {
        return [
            this.getDungeonIdRule(),
            this.getGroupIdRule(),
            this.getSortFieldRule(),
            this.getSortOrderRule(),
            this.getServerIdRule(),
            this.getPageRule(),
            this.getRecordsOnPageRule(),
            this.getCharsFilterRule(),
            this.getCharCountFilterRule()
        ];
    }

    private static getGroupIdRule(): ValidationRule<GetWarEchoesListQuery> {
        return new ValidationRule(
            item => item.groupId === undefined || typeof item.groupId === "string",
            "groupId must be a string"
        );
    }

    private static getCharsFilterRule(): ValidationRule<GetWarEchoesListQuery> {
        return new ValidationRule(
            item => typeof item.charsFilter === "string" && (item.charsFilter === "" || this.FILTER_LIST_REGEX.test(item.charsFilter)),
            "charsFilter must be list of char ids separated by commas"
        );
    }

    private static getCharCountFilterRule(): ValidationRule<GetWarEchoesListQuery> {
        return new ValidationRule(
            item => typeof item.charCountFilter === "string" && (item.charCountFilter === "" || this.COUNT_FILTER_LIST_REGEX.test(item.charCountFilter)),
            "charCountFilter must be list of numbers separated by commas"
        );
    }

    private static getDungeonIdRule(): ValidationRule<GetWarEchoesListQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.dungeonId),
            "dungeonId must be a string"
        );
    }

    private static getSortFieldRule(): ValidationRule<GetWarEchoesListQuery> {
        return new ValidationRule(
            item => typeof item.sortField === "string" && WarEchoesLeaderboardSortField.isSortField(item.sortField),
            "sortField must be 'level' or 'time'"
        );
    }

    private static getSortOrderRule(): ValidationRule<GetWarEchoesListQuery> {
        return new ValidationRule(
            item => typeof item.sortOrder === "string" && SortOrder.isSortOrder(item.sortOrder),
            "sortOrder must be 'asc' or 'desc'"
        );
    }

    private static getServerIdRule(): ValidationRule<GetWarEchoesListQuery> {
        return new ValidationRule(
            item => typeof item.serverId === "string" && (GameServerId.isServerId(item.serverId) || item.serverId === "all"),
            "serverId must be '2' or '3' or 'all'"
        );
    }

    private static getPageRule(): ValidationRule<GetWarEchoesListQuery> {
        return new ValidationRule(
            item => typeof item.page === "string" && !isNaN(parseInt(item.page, 10)) && parseInt(item.page, 10) > 0,
            "page must be a natural number"
        );
    }

    private static getRecordsOnPageRule(): ValidationRule<GetWarEchoesListQuery> {
        return new ValidationRule(
            item => typeof item.recordsOnPage === "string" && this.recordsOnPageSet.has(item.recordsOnPage),
            "recordsOnPage must be one of: 10, 20, 40, 50, 60, 80, 100"
        );
    }
}
