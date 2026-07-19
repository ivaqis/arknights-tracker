import { MonumentLeaderboardCharEntity } from "@models/monumentLeaderboard/entities/MonumentLeaderboardCharEntity";

export interface MonumentLeaderboardRunEntity {
    gameUid: string;
    dungeonId: string;
    ts: number;
    passTs: string;
    chars: MonumentLeaderboardCharEntity[];
}