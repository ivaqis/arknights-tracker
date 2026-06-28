import { RecordEntity } from "src/database/entities/RecordEntity";

export interface ImportErrorEntity extends RecordEntity {
    id: number,
    createdAt: Date,
    url: string,
    message: string,
    stack?: string,
    serverId?: string,
    solved: boolean
}