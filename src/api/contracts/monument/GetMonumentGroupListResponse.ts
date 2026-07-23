import { Amount } from "@models/Amount";
import {
    MonumentLeaderboardGroupRunRecordEntity
} from "@models/monumentLeaderboard/entities/MonumentLeaderboardGroupRunRecordEntity";

export interface GetMonumentGroupListResponse {
    list: MonumentLeaderboardGroupRunRecordEntity[];
    totalCount: number;
    filters: {
        chars: Amount[];
        charCount: Amount[];
    }
}