import { ContractLeaderboardRecordEntity } from "@models/contractLeaderboard/entities/ContractLeaderboardRecordEntity.js";
import { Amount } from "@models/Amount.js";

export interface GetContractListResponse {
    list: ContractLeaderboardRecordEntity[];
    totalCount: number;
    filters?: {
        chars: Amount[];
    };
}