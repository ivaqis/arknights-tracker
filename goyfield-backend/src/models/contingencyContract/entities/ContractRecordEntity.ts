import { ContractCharEntity } from "@models/contingencyContract/entities/ContractCharEntity.js";

export interface ContractRecordEntity {
    recordId: string;
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