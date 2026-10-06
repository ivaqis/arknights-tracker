import { WarEchoesLeaderboardRunEntity } from "@models/warEchoesLeaderboard/entities/WarEchoesLeaderboardRunEntity.js";

export interface GetWarEchoesRunResponse {
    uid: string;
    avatarId: string | null;
    level: number;
    serverId: string;
    recordData: WarEchoesLeaderboardRunEntity;
}
