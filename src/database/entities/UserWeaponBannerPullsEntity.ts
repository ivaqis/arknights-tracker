import { RecordEntity } from "src/database/entities/RecordEntity";

export interface UserWeaponBannerPullsEntity extends RecordEntity {
    profileId: bigint,
    bannerId: string,
    last6Pull: number,
    last5Pull: number,
    lastWin5050Pull: number,
    lastPullTimeTs: bigint,
    updatedAt: Date
}