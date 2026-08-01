import { RecordEntity } from "src/database/entities/RecordEntity";

export interface UserBannerStatEntity extends RecordEntity {
    profileId: bigint,
    bannerId: string,
    bannerType: string,
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