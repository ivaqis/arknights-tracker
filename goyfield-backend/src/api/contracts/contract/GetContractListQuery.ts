import { ContractLeaderboardSortField } from "@models/contractLeaderboard/ContractLeaderboardSortField.js";
import { GameServerId } from "@models/GameServerId.js";
import { SortOrder } from "@models/SortOrder.js";

export interface GetContractListQuery {
    contractId: string;
    sortField: ContractLeaderboardSortField;
    sortOrder: SortOrder;
    serverId: GameServerId | "all";
    page: string;
    recordsOnPage: "40" | "60" | "80" | "100";
}