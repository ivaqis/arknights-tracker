import { ContractURLParams } from "@services/skportContractsFetcher/contracts/ContractURLParams";

export interface ContractRecordURLParams extends ContractURLParams {
    recordId: string;
}