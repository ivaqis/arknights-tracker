import { RecordEntity } from "src/database/entities/RecordEntity";

export interface GlobalBannerTimelineEntity extends RecordEntity {
    bannerId: string,
    date: string,
    pullsCount: number
}