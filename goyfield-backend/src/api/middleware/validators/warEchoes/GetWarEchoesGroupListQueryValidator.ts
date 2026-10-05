import { GetWarEchoesGroupListQuery } from "@api/contracts/warEchoes/GetWarEchoesGroupListQuery.js";
import { GetWarEchoesListQueryValidator } from "@api/middleware/validators/warEchoes/GetWarEchoesListQueryValidator.js";
import { GameServerId } from "@models/GameServerId.js";
import { WarEchoesLeaderboardSortField } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";
import { StringValidationRule } from "@models/validation/StringValidationRule.js";
import { ValidationRule } from "@models/validation/ValidationRule.js";
import { Validator } from "@models/validation/Validator.js";

export class GetWarEchoesGroupListQueryValidator extends Validator<GetWarEchoesGroupListQuery> {
    private static readonly recordsOnPageSet = new Set(GetWarEchoesListQueryValidator.recordsOnPage);

    public constructor(item: GetWarEchoesGroupListQuery) {
        super(item, GetWarEchoesGroupListQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetWarEchoesGroupListQuery>[] {
        return [
            this.getGroupIdRule(),
            this.getDifficultyRule(),
            this.getSortFieldRule(),
            this.getSortOrderRule(),
            this.getServerIdRule(),
            this.getRecordsOnPageRule(),
            this.getPageRule(),
            this.getCharsFilterRule(),
            this.getCharCountFilterRule()
        ];
    }

    private static getCharsFilterRule(): ValidationRule<GetWarEchoesGroupListQuery> {
        return new ValidationRule(
            item => typeof item.charsFilter === "string" && (item.charsFilter === "" || GetWarEchoesListQueryValidator.FILTER_LIST_REGEX.test(item.charsFilter)),
            "charsFilter must be list of char ids separated by commas"
        );
    }

    private static getCharCountFilterRule(): ValidationRule<GetWarEchoesGroupListQuery> {
        return new ValidationRule(
            item => typeof item.charCountFilter === "string" && (item.charCountFilter === "" || GetWarEchoesListQueryValidator.COUNT_FILTER_LIST_REGEX.test(item.charCountFilter)),
            "charCountFilter must be list of numbers separated by commas"
        );
    }

    private static getGroupIdRule(): ValidationRule<GetWarEchoesGroupListQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.groupId),
            "groupId must be a string"
        );
    }

    private static getDifficultyRule(): ValidationRule<GetWarEchoesGroupListQuery> {
        return new ValidationRule(
            item => item.difficulty === "normal" || item.difficulty === "hard" || item.difficulty === "brutal",
            "difficulty must be 'normal', 'hard', or 'brutal'"
        );
    }

    private static getSortFieldRule(): ValidationRule<GetWarEchoesGroupListQuery> {
        return new ValidationRule(
            item => typeof item.sortField === "string" && WarEchoesLeaderboardSortField.isSortField(item.sortField),
            "sortField must be 'level' or 'time'"
        );
    }

    private static getSortOrderRule(): ValidationRule<GetWarEchoesGroupListQuery> {
        return new ValidationRule(
            item => typeof item.sortOrder === "string" && SortOrder.isSortOrder(item.sortOrder),
            "sortOrder must be 'asc' or 'desc'"
        );
    }

    private static getServerIdRule(): ValidationRule<GetWarEchoesGroupListQuery> {
        return new ValidationRule(
            item => typeof item.serverId === "string" && (GameServerId.isServerId(item.serverId) || item.serverId === "all"),
            "serverId must be '2' or '3' or 'all'"
        );
    }

    private static getPageRule(): ValidationRule<GetWarEchoesGroupListQuery> {
        return new ValidationRule(
            item => typeof item.page === "string" && !isNaN(parseInt(item.page, 10)) && parseInt(item.page, 10) > 0,
            "page must be a natural number"
        );
    }

    private static getRecordsOnPageRule(): ValidationRule<GetWarEchoesGroupListQuery> {
        return new ValidationRule(
            item => typeof item.recordsOnPage === "string" && this.recordsOnPageSet.has(item.recordsOnPage),
            "recordsOnPage must be one of: 10, 20, 40, 50, 60, 80, 100"
        );
    }
}
