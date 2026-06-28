import { RecordEntity } from "src/database/entities/RecordEntity";

export interface GlobalPityDistributionEntity extends RecordEntity {
    bannerId: string,
    pity: number,
    rarity: number,
    count: number
}