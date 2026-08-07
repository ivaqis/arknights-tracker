import { MonumentLeaderboardRunEntity } from "@models/monumentLeaderboard/entities/MonumentLeaderboardRunEntity.js";

export interface GetMonumentGroupRunResponse {
    uid: string;
    avatarId: string | null;
    level: number;
    serverId: string;
    groupId: string;
    recordsData: MonumentLeaderboardRunEntity[];
}