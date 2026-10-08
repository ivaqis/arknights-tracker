import type { Rarity } from "$lib/classes/Rarity";

export interface EquipmentFilterOptions {
    rarity: Rarity[];
    partType: string[];
    pack: string[];
    stats_any: string[][];
    stats: string[][];
    stats_1: string[];
    stats_2: string[];
    stats_3: string[];
}