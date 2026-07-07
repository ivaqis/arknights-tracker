import { ContractCharEntity } from "@models/contingencyContract/entities/ContractCharEntity";

export interface ContractRecordEntity {
    contractId: string;
    ts: string;
    passTs: number;
    isPass: boolean;
    indicatorCount: number;
    passWave: number;
    isBest: boolean;
    indicators: string[];
    chars: ContractCharEntity[];
}