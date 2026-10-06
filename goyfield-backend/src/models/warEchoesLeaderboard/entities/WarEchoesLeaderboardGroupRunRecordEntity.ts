import { WarEchoesLeaderboardRunEntity } from "@models/warEchoesLeaderboard/entities/WarEchoesLeaderboardRunEntity.js";

export interface WarEchoesLeaderboardGroupRunRecordEntity {
    uid: string;
    avatarId: string | null;
    level: number;
    serverId: string;
    groupId: string;
    totalPassTs: number;
    records: WarEchoesLeaderboardRunEntity[];
}
