import { RecordEntity } from "src/database/entities/RecordEntity";

export interface ImportErrorEntity extends RecordEntity {
    id: number,
    createdAt: Date,
    url: string,
    message: string,
    stack: string | null,
    serverId: string | null,
    solved: boolean
}