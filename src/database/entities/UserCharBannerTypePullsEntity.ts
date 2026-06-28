export interface UserCharBannerTypePullsEntity {
    uid: bigint,
    bannerType: string,
    last6Pull: number,
    last5pull: number,
    lastWin5050Pull: number,
    lastPullTimeTs: bigint,
    updatedAt: Date
}