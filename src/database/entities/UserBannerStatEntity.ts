export interface UserBannerStatEntity {
    uid: string,
    bannerId: string,
    totalPulls: number,
    total6: number,
    total5: number,
    sumPity6: number,
    sumPity5: number,
    won5050: number,
    total5050: number,
    lastUpdate: Date,
    lasProcessedPullTime: bigint
}