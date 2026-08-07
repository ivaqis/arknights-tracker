import { Amount } from "@models/Amount.js";
import {
    MonumentLeaderboardGroupRunRecordEntity
} from "@models/monumentLeaderboard/entities/MonumentLeaderboardGroupRunRecordEntity.js";

export interface GetMonumentGroupListResponse {
    list: MonumentLeaderboardGroupRunRecordEntity[];
    totalCount: number;
    filters: {
        chars: Amount[];
        charCount: Amount[];
    }
}