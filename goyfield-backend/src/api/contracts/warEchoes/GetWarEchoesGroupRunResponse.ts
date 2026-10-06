import { WarEchoesLeaderboardRunEntity } from "@models/warEchoesLeaderboard/entities/WarEchoesLeaderboardRunEntity.js";

export interface GetWarEchoesGroupRunResponse {
    uid: string;
    avatarId: string | null;
    level: number;
    serverId: string;
    groupId: string;
    recordsData: WarEchoesLeaderboardRunEntity[];
}
