import { RecordEntity } from "src/database/entities/RecordEntity";

export interface UserBannerProfileEntity extends RecordEntity {
    profileId: bigint,
    publicId: string,
    createdAt: Date,
    updatedAt: Date
}