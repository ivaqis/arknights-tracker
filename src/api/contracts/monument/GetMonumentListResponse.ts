import { Amount } from "@models/Amount.js";
import {
    MonumentLeaderboardRunRecordEntity
} from "@models/monumentLeaderboard/entities/MonumentLeaderboardRunRecordEntity.js";

export interface GetMonumentListResponse {
    list: MonumentLeaderboardRunRecordEntity[];
    totalCount: number;
    filters: {
        chars: Amount[];
        charCount: Amount[];
    }
}