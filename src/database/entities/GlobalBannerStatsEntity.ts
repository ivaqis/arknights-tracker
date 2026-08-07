import { RecordEntity } from "@database/entities/RecordEntity.js";

export interface GlobalBannerStatsEntity extends RecordEntity {
    bannerId: string,
    totalUsers: number,
    unfreePulls: number,
    total6: number,
    total5: number,
    won5050: number,
    total5050: number,
    freePulls: number,
    free6: number,
    free5: number,
    freeWin5050: number,
    updatedAt: Date
}