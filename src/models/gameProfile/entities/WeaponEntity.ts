import { GemEntity } from "@models/gameProfile/entities/GemEntity";

export interface WeaponEntity {
    id: string;
    level: number;
    breakthroughLevel: number;
    gem: GemEntity | null;
}