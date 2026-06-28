export interface UserWeaponBannerPullsEntity {
    uid: bigint,
    bannerId: string,
    last6Pull: number,
    last5Pull: number,
    lastWin5050Pull: number,
    lastPullTimeTs: bigint,
    updatedAt: Date
}