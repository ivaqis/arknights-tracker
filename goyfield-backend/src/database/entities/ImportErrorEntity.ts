import { RecordEntity } from "@database/entities/RecordEntity.js";

export interface ImportErrorEntity extends RecordEntity {
    id: number,
    createdAt: Date,
    url: string,
    message: string,
    stack: string | null,
    serverId: string | null,
    solved: boolean
}