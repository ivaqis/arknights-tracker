import { ContractRecordEntity } from "@models/contingencyContract/entities/ContractRecordEntity.js";

export interface GetContractRunResponse {
    uid: string;
    avatarId: string | null;
    level: number;
    serverId: string;
    recordData: ContractRecordEntity;
}