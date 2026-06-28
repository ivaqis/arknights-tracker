import { RecordEntity } from "src/database/entities/RecordEntity";

export interface GeneratedTokenEntity extends RecordEntity {
    token: string,
    uid: bigint
}