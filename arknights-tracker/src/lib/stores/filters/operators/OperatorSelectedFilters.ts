import type { Rarity } from "$lib/classes/Rarity";

export interface OperatorSelectedFilters {
    rarity?: Set<Rarity>;
    class?: Set<string>;
    element?: Set<string>;
    weapon?: Set<string>;
    skillMaterialType?: Set<string>;
    skillMaterial?: Set<string>;
    baseSkill?: Set<string>;
}