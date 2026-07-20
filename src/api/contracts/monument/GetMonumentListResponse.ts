import {
    MonumentLeaderboardRunRecordEntity
} from "@models/monumentLeaderboard/entities/MonumentLeaderboardRunRecordEntity";

export interface GetMonumentListResponse {
    list: MonumentLeaderboardRunRecordEntity[];
    totalCount: number;
}