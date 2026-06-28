export interface UserCharBannerPullsEntity {
    uid: bigint,
    bannerId: string,
    last6LimitedPull: number,
    updatedAt: Date
}