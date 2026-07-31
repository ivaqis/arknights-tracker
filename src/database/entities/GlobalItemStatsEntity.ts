import { RecordEntity } from "src/database/entities/RecordEntity";

export interface GlobalItemStatsEntity extends RecordEntity {
    bannerId: string,
    itemId: string,
    rarity: number,
    count: number
}