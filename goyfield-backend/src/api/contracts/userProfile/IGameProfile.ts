import { ContractRecordEntity } from "@models/contingencyContract/entities/ContractRecordEntity.js";
import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity.js";
import { PullProfileEntity } from "@models/pullProfile/entities/PullProfileEntity.js";

export interface IMonumentProfileRun {
    id: string;
    dungeonId: string;
    groupId: string;
    isHard: boolean;
    clearTimeSec: number;
    rank: number;
    totalCount: number;
    ts: string;
    chars: { id: string; level: number; potentialLevel: number }[];
    updatedAt: Date;
}

export interface IWarEchoesProfileRun {
    id: string;
    dungeonId: string;
    groupId: string;
    difficulty: string;
    clearTimeSec: number;
    rank: number;
    totalCount: number;
    ts: string;
    chars: { id: string; level: number; potentialLevel: number }[];
    updatedAt: Date;
}

export interface IGameProfile {
    gameProfile: GameProfileEntity;
    pulls: PullProfileEntity | null;
    contract: ContractRecordEntity | null;
    monument?: IMonumentProfileRun[];
    warEchoes?: IWarEchoesProfileRun[];
}