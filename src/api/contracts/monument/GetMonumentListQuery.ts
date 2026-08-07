import { GameServerId } from "@models/GameServerId.js";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";

export interface GetMonumentListQuery {
    dungeonId: string;
    sortField: MonumentLeaderboardSortField;
    sortOrder: SortOrder;
    serverId: GameServerId | "all";
    page: string;
    recordsOnPage: "40" | "60" | "80" | "100";
    charsFilter: string;
    charCountFilter: string;
}