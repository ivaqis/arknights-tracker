import type { Rarity } from "$lib/classes/Rarity";

export interface WeaponFilterOptions {
    rarity: Rarity[];
    type: string[];
    essence: number[];
    attr1: string[];
    attr2: string[];
    attr3: string[];
}