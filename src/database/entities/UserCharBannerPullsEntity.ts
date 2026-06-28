import { RecordEntity } from "src/database/entities/RecordEntity";

export interface UserCharBannerPullsEntity extends RecordEntity {
    uid: bigint,
    bannerId: string,
    last6LimitedPull: number,
    updatedAt: Date
}