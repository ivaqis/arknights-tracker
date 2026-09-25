import { IndicatorEntity } from "@staticModels/crisisContracts/IndicatorEntity.js";

export interface CrisisContractEntity {
    id: string;
    apiId: string;
    isCurrent?: boolean;
    indicators: IndicatorEntity[]
}