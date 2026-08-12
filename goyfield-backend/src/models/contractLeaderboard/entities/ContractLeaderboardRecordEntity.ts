import { ContractLeaderboardCharEntity } from "@models/contractLeaderboard/entities/ContractLeaderboardCharEntity.js";

export interface ContractLeaderboardRecordEntity {
    recordId: string;
    uid: string;
    avatarId: string | null;
    level: number;
    serverId: string;
    indicatorCount: number;
    ts: string;
    passTs: number;
    chars: ContractLeaderboardCharEntity[];
}