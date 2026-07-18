import { ContractLeaderboardSortField } from "@models/contractLeaderboard/ContractLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";

export interface GetContractListQuery {
    contractId: string;
    sortField: ContractLeaderboardSortField;
    sortOrder: SortOrder; // todo фильтр по serverId
}