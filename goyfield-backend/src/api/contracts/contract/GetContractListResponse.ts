import { ContractLeaderboardRecordEntity } from "@models/contractLeaderboard/entities/ContractLeaderboardRecordEntity.js";

export interface GetContractListResponse {
    list: ContractLeaderboardRecordEntity[];
    totalCount: number;
}