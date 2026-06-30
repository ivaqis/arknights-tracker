import { RecordEntity } from "src/database/entities/RecordEntity";

export interface UserCharBannerTypePullsEntity extends RecordEntity {
    profileId: bigint,
    bannerType: string,
    last6Pull: number,
    last5Pull: number,
    lastWin5050Pull: number,
    lastPullTimeTs: bigint,
    updatedAt: Date
}