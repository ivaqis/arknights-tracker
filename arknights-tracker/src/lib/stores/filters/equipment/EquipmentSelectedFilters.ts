import type { Rarity } from "$lib/classes/Rarity";

export interface EquipmentSelectedFilters {
    rarity?: Set<Rarity>;
    partType?: Set<string>;
    pack?: Set<string>;
    stats_any?: Set<string>;
    stats_1?: Set<string>;
    stats_2?: Set<string>;
    stats_3?: Set<string>;
}