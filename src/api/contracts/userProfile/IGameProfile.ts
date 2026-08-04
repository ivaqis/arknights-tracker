import { ContractRecordEntity } from "@models/contingencyContract/entities/ContractRecordEntity";
import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity";
import { PullProfileEntity } from "@models/pullProfile/entities/PullProfileEntity";

export interface IGameProfile {
    gameProfile: GameProfileEntity;
    pulls: PullProfileEntity | null;
    contract: ContractRecordEntity | null;
}