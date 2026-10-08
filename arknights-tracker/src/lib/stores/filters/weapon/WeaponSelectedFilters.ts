import type { Rarity } from "$lib/classes/Rarity";

export interface WeaponSelectedFilters {
    rarity?: Set<Rarity>;
    type?: Set<string>;
    essence?: Set<number>;
    attr1?: Set<string>;
    attr2?: Set<string>;
    attr3?: Set<string>;
}