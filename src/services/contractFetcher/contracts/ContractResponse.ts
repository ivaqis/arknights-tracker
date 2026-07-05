import { ContractData } from "@services/contractFetcher/contracts/ContractData";

export interface ContractResponse {
    code: number;
    message: string;
    timestamp: string;
    data: {
        crisisContract: ContractData;
    }
}