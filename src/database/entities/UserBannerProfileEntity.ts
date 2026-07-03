import { RecordEntity } from "src/database/entities/RecordEntity";

export interface UserBannerProfileEntity extends RecordEntity {
    profileId: bigint,
    gameUid?: string,
    createdAt: Date
}