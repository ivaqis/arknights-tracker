import { MonumentLeaderboardRunEntity } from "@models/monumentLeaderboard/entities/MonumentLeaderboardRunEntity";

export interface MonumentLeaderboardGroupRunRecordEntity {
    uid: string;
    avatarId: string | null;
    level: number;
    serverId: string;
    groupId: string;
    totalPassTs: number;
    records: MonumentLeaderboardRunEntity[];
}