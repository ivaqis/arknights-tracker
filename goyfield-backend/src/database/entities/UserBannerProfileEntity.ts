import { RecordEntity } from "@database/entities/RecordEntity.js";

export interface UserBannerProfileEntity extends RecordEntity {
    profileId: bigint,
    publicId: string,
    privateId: string,
    version: number,
    createdAt: Date,
    updatedAt: Date
}