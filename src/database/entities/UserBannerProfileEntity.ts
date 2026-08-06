import { RecordEntity } from "src/database/entities/RecordEntity";

export interface UserBannerProfileEntity extends RecordEntity {
    profileId: bigint,
    publicId: string,
    privateId: string,
    version: number,
    createdAt: Date,
    updatedAt: Date
}