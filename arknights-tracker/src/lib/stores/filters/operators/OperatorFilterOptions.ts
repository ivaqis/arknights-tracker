import type { Rarity } from "$lib/classes/Rarity";

export interface OperatorFilterOptions {
    rarity: Rarity[];
    class: string[];
    element: string[];
    weapon: string[];
    skillMaterialType: string[];
    skillMaterial: string[];
    baseSkill: string[];
}