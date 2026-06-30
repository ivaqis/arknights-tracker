import { RecordEntity } from "src/database/entities/RecordEntity";

export interface BannerProfileEntity extends RecordEntity {
    profileId: bigint,
    createdAt: Date
}