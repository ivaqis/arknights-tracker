import { GameServerId } from "@models/GameServerId";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";
import { BooleanString } from "@models/validation/BooleanStringValidationRule";

export interface GetMonumentGroupListQuery {
    groupId: string;
    isHard: BooleanString;
    sortField: MonumentLeaderboardSortField;
    sortOrder: SortOrder;
    serverId: GameServerId | "all";
    page: string;
    recordsOnPage: "40" | "60" | "80" | "100";
    charsFilter: string;
    charCountFilter: string;
}