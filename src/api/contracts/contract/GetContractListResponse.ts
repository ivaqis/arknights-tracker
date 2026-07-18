import { ContractLeaderboardRecordEntity } from "@models/contractLeaderboard/entities/ContractLeaderboardRecordEntity";

export interface GetContractListResponse {
    list: ContractLeaderboardRecordEntity[];
    totalCount: number;
}