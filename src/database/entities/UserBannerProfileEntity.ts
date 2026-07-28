import { RecordEntity } from "src/database/entities/RecordEntity";

export interface UserBannerProfileEntity extends RecordEntity {
    profileId: bigint,
    publicId: string,
    gameUid: string | null,
    createdAt: Date,
    updatedAt: Date
}