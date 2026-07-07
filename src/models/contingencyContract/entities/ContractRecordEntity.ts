import { ContractCharEntity } from "@models/contingencyContract/entities/ContractCharEntity";

export interface ContractRecordEntity {
    contractId: string;
    ts: string;
    passTs: string;
    isPass: boolean;
    indicatorCount: number;
    passWave: number;
    isBest: boolean;
    indicators: string[];
    chars: ContractCharEntity[];
}