import { GemEntity } from "@models/gameProfile/entities/GemEntity";

export interface WeaponEntity {
    id: string;
    level: number;
    refineLevel: number;
    gem: GemEntity | null;
}