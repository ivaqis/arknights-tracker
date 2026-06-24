export interface GlobalBannerStatsEntity {
    bannerId: string,
    totalPulls: bigint,
    totalUsers: number,
    total6: number,
    total5: number,
    limitedCount: number,
    lost5050: number,
    updatedAt: Date
}