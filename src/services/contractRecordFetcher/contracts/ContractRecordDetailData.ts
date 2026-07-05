import { CharData } from "@services/contractRecordFetcher/contracts/CharData";
import { IndicatorData } from "@services/contractRecordFetcher/contracts/IndicatorData";

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