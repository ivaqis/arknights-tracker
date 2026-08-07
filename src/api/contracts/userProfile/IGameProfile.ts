import { ContractRecordEntity } from "@models/contingencyContract/entities/ContractRecordEntity.js";
import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity.js";
import { PullProfileEntity } from "@models/pullProfile/entities/PullProfileEntity.js";

export interface IGameProfile {
    gameProfile: GameProfileEntity;
    pulls: PullProfileEntity | null;
    contract: ContractRecordEntity | null;
}