import { WarEchoesLeaderboardRunEntity } from "@models/warEchoesLeaderboard/entities/WarEchoesLeaderboardRunEntity.js";

export interface WarEchoesLeaderboardRunRecordEntity extends WarEchoesLeaderboardRunEntity {
    uid: string;
    avatarId: string | null;
    level: number;
    serverId: string;
}
