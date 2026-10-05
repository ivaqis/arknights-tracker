import { Amount } from "@models/Amount.js";
import {
    WarEchoesLeaderboardRunRecordEntity
} from "@models/warEchoesLeaderboard/entities/WarEchoesLeaderboardRunRecordEntity.js";

export interface GetWarEchoesListResponse {
    list: WarEchoesLeaderboardRunRecordEntity[];
    totalCount: number;
    filters: {
        chars: Amount[];
        charCount: Amount[];
    };
}
