import { Amount } from "@models/Amount";
import {
    MonumentLeaderboardRunRecordEntity
} from "@models/monumentLeaderboard/entities/MonumentLeaderboardRunRecordEntity";

export interface GetMonumentListResponse {
    list: MonumentLeaderboardRunRecordEntity[];
    totalCount: number;
    filters: {
        chars: Amount[];
        charCount: Amount[];
    }
}