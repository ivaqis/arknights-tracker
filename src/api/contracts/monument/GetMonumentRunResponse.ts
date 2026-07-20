import { MonumentLeaderboardRunEntity } from "@models/monumentLeaderboard/entities/MonumentLeaderboardRunEntity";

export interface GetMonumentRunResponse {
    uid: string;
    avatarId: string | null;
    level: number;
    serverId: string;
    recordData: MonumentLeaderboardRunEntity;
}