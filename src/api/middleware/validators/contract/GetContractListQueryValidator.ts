import { GetContractListQuery } from "@api/contracts/contract/GetContractListQuery";
import { ContractLeaderboardSortField } from "@models/contractLeaderboard/ContractLeaderboardSortField";
import { GameServerId } from "@models/GameServerId";
import { SortOrder } from "@models/SortOrder";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";
import { crisisContractRecords } from "@staticModels/instances";

export class GetContractListQueryValidator extends Validator<GetContractListQuery> {
    public static readonly recordsOnPage = ["40", "60", "80", "100"] as const;
    private static readonly recordsOnPageSet = new Set(this.recordsOnPage);

    public constructor(item: GetContractListQuery) {
        super(item, GetContractListQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetContractListQuery>[] {
        return [
            this.getContractIdRule(),
            this.getSortFieldRule(),
            this.getSortOrderRule(),
            this.getServerIdsRule(),
            this.getPageRule(),
            this.getRecordsOnPageRule()
        ];
    }

    private static getContractIdRule(): ValidationRule<GetContractListQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.contractId) && !!crisisContractRecords.getContractById(item.contractId),
            "contractId must be a string"
        );
    }

    private static getSortFieldRule(): ValidationRule<GetContractListQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.sortField) && ContractLeaderboardSortField.isSortField(item.sortField),
            "sortField must be level | indicatorCount | time"
        );
    }

    private static getSortOrderRule(): ValidationRule<GetContractListQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.sortOrder) && SortOrder.isSortOrder(item.sortOrder),
            "sortOrder must be asc | desc"
        );
    }

    private static getServerIdsRule(): ValidationRule<GetContractListQuery> {
        return new ValidationRule(
            item => typeof item.serverId === "string" && (GameServerId.isServerId(item.serverId) || item.serverId === "all"),
            "serverId must be '2' or '3' or 'all'"
        );
    }

    private static getPageRule(): ValidationRule<GetContractListQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.page) && !isNaN(parseInt(item.page, 10)) && parseInt(item.page, 10) > 0,
            "page must be a natural number"
        );
    }

    private static getRecordsOnPageRule(): ValidationRule<GetContractListQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.recordsOnPage) && this.recordsOnPageSet.has(item.recordsOnPage),
            "recordsOnPage must be 40 or 60 or 80 or 100"
        );
    }
}