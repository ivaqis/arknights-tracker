import { EnemyComparatorName } from "$lib/classes/comparators/names/EnemyComparatorName";
import type { IFilterSelector } from "$lib/classes/filters/IFilterSelector";
import type { Rarity } from "$lib/classes/Rarity";

export interface EnemyFilters {
    [EnemyComparatorName.RARITY]: IFilterSelector<any, Rarity>;
    [EnemyComparatorName.GROUP_ID]: IFilterSelector<any, string>;
}