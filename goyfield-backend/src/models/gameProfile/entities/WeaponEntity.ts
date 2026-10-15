import { GemEntity } from "@models/gameProfile/entities/GemEntity.js";

export interface WeaponEntity {
    id: string;
    level: number;
    refineLevel: number;
    breakthroughLevel?: number;
    weaponTerms?: number[];
    gem: GemEntity | null;
}