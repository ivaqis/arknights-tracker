import { ContractURLParams } from "@services/contractFetcher/contracts/ContractURLParams";

export interface ContractRecordURLParams extends ContractURLParams {
    recordId: string;
}