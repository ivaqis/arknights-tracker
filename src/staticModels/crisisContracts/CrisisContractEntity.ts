import { IndicatorEntity } from "@staticModels/crisisContracts/IndicatorEntity";

export interface CrisisContractEntity {
    id: string;
    apiId: string;
    isCurrent?: boolean;
    indicators: IndicatorEntity[]
}