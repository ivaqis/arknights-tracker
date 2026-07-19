import { ContractLeaderboardSortField } from "@models/contractLeaderboard/ContractLeaderboardSortField";
import { GameServerId } from "@models/GameServerId";
import { SortOrder } from "@models/SortOrder";

export interface GetContractListQuery {
    contractId: string;
    sortField: ContractLeaderboardSortField;
    sortOrder: SortOrder; // todo фильтр по serverId
    serverId: GameServerId | "all";
    page: string;
    recordsOnPage: "40" | "60" | "80" | "100";
}