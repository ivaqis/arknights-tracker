import { MonumentLeaderboardCharEntity } from "@models/monumentLeaderboard/entities/MonumentLeaderboardCharEntity.js";

export interface MonumentLeaderboardRunEntity {
    recordId: string;
    dungeonId: string;
    ts: string;
    passTs: number;
    chars: MonumentLeaderboardCharEntity[];
}