import { CharData } from "@services/contractFetcher/contracts/CharData";

export interface ContractRecordData {
    id: string;
    chars: CharData[];
    ts: string;
    passTs: string;
    isPass: boolean;
    indicatorCount: number;
    passWave: number;
    isBest: boolean;
}