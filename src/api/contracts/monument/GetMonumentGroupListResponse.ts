import {
    MonumentLeaderboardGroupRunRecordEntity
} from "@models/monumentLeaderboard/entities/MonumentLeaderboardGroupRunRecordEntity";

export interface GetMonumentGroupListResponse {
    list: MonumentLeaderboardGroupRunRecordEntity[];
    totalCount: number;
}