import { RecordEntity } from "@database/entities/RecordEntity.js";

export interface GlobalItemStatsEntity extends RecordEntity {
    bannerId: string,
    itemId: string,
    rarity: number,
    count: number
}