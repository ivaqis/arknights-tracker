import { RecordEntity } from "@database/entities/RecordEntity.js";

export interface GlobalBannerTimelineEntity extends RecordEntity {
    bannerId: string,
    date: string,
    totalPullsCount: number,
    freePullsCount: number
}