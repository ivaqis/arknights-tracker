import { MonumentLeaderboardCharEntity } from "@models/monumentLeaderboard/entities/MonumentLeaderboardCharEntity";

export interface MonumentLeaderboardRunEntity {
    recordId: string;
    dungeonId: string;
    ts: string;
    passTs: number;
    chars: MonumentLeaderboardCharEntity[];
}