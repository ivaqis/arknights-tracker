import { CharData } from "@services/contractRecordFetcher/contracts/CharData.js";
import { IndicatorData } from "@services/contractRecordFetcher/contracts/IndicatorData.js";

export interface ContractRecordDetailData {
    id: string;
    chars: CharData[];
    ts: string;
    passTs: string;
    isPass: boolean;
    indicatorCount: number;
    passWave: number;
    isBest : boolean;
    indicators: IndicatorData[];
    indicatorIds: string[];
}