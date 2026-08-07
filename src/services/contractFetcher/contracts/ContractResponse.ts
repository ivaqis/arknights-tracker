import { ContractData } from "@services/contractFetcher/contracts/ContractData.js";

export interface ContractResponse {
    code: number;
    message: string;
    timestamp: string;
    data: {
        crisisContract: ContractData;
    }
}