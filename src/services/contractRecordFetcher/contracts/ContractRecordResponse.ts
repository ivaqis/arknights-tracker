import { ContractRecordDetailData } from "@services/contractRecordFetcher/contracts/ContractRecordDetailData.js";

export interface ContractRecordResponse {
    code: number;
    message: string;
    timestamp: string;
    data: {
        recordDetail: ContractRecordDetailData;
    }
}