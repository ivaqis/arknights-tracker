import { Amount } from "@models/Amount.js";
import {
    WarEchoesLeaderboardGroupRunRecordEntity
} from "@models/warEchoesLeaderboard/entities/WarEchoesLeaderboardGroupRunRecordEntity.js";

export interface GetWarEchoesGroupListResponse {
    list: WarEchoesLeaderboardGroupRunRecordEntity[];
    totalCount: number;
    filters: {
        chars: Amount[];
        charCount: Amount[];
    };
}
