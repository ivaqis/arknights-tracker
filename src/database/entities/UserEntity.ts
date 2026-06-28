import { RecordEntity } from "src/database/entities/RecordEntity";

export interface UserEntity extends RecordEntity {
    uid: bigint,
    createdAt: Date
}