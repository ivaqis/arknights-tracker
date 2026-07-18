import { GetContractListQuery } from "@api/contracts/contract/GetContractListQuery";
import { ContractLeaderboardSortField } from "@models/contractLeaderboard/ContractLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";
import { crisisContractRecords } from "@staticModels/instances";

export class GetContractListQueryValidator extends Validator<GetContractListQuery> {

    public constructor(item: GetContractListQuery) {
        super(item, GetContractListQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetContractListQuery>[] {
        return [
            this.getContractIdRule(),
            this.getSortFieldRule(),
            this.getSortOrderRule()
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
}