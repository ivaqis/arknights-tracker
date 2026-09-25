import { RecordEntity } from "@database/entities/RecordEntity.js";

export interface UserCharBannerPullsEntity extends RecordEntity {
    profileId: bigint,
    bannerId: string,
    last6LimitedPull: number,
    updatedAt: Date
}