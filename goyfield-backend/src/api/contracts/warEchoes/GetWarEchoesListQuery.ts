import { GameServerId } from "@models/GameServerId.js";
import { WarEchoesLeaderboardSortField } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";

export interface GetWarEchoesListQuery {
    dungeonId: string;
    sortField: WarEchoesLeaderboardSortField;
    sortOrder: SortOrder;
    serverId: GameServerId | "all";
    page: string;
    recordsOnPage: "10" | "20" | "40" | "50" | "60" | "80" | "100";
    charsFilter: string;
    charCountFilter: string;
}
