import { ContractCharEntity } from "@models/contingencyContract/entities/ContractCharEntity";

export interface ContractRecordEntity {
    id: string;
    contractId: string;
    contractApiId: string;
    ts: string;
    passTs: string;
    isPass: boolean;
    indicatorCount: number;
    passWave: number;
    isBest: boolean;
    indicators: string[];
    chars: ContractCharEntity[];
}