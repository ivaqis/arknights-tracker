import { ContractURLParams } from "@services/contractFetcher/contracts/ContractURLParams.js";

export interface ContractRecordURLParams extends ContractURLParams {
    recordId: string;
}