import { RecordEntity } from "src/database/entities/RecordEntity";

export interface UserCharBannerTypePullsEntity extends RecordEntity {
    uid: bigint,
    bannerType: string,
    last6Pull: number,
    last5pull: number,
    lastWin5050Pull: number,
    lastPullTimeTs: bigint,
    updatedAt: Date
}