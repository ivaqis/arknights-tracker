import { WarEchoesLeaderboardCharEntity } from "@models/warEchoesLeaderboard/entities/WarEchoesLeaderboardCharEntity.js";

export interface WarEchoesLeaderboardRunEntity {
    recordId: string;
    dungeonId: string;
    ts: string;
    passTs: number;
    chars: WarEchoesLeaderboardCharEntity[];
}
