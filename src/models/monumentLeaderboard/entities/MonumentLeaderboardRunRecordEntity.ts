import { MonumentLeaderboardRunEntity } from "@models/monumentLeaderboard/entities/MonumentLeaderboardRunEntity.js";

export interface MonumentLeaderboardRunRecordEntity extends MonumentLeaderboardRunEntity {
    uid: string;
    avatarId: string | null;
    level: number;
    serverId: string;
}