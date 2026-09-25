import { RecordEntity } from "@database/entities/RecordEntity.js";

export interface GlobalPityDistributionEntity extends RecordEntity {
    bannerId: string,
    pity: number,
    rarity: number,
    count: number
}