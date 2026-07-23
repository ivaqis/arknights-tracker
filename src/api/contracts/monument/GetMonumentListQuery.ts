import { GameServerId } from "@models/GameServerId";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";

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