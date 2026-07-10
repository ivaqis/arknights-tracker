import { ContractRecordEntity } from "@models/contingencyContract/entities/ContractRecordEntity";
import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity";

export interface IGameProfile {
    gameProfile: GameProfileEntity;
    contract: ContractRecordEntity | null;
}