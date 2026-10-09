import type { LocaleOrder } from "$lib/classes/comparators/LocaleOrder";
import type { EnemyComparatorName } from "$lib/classes/comparators/names/EnemyComparatorName";
import type { Rarity } from "$lib/classes/Rarity";

export interface EnemySortParams {
    sortFieldOrder: EnemyComparatorName[];
    sortFieldParams: {
        [EnemyComparatorName.RARITY]: Rarity[];
        [EnemyComparatorName.GROUP_ID]: string[];
        [EnemyComparatorName.LOCALE]: LocaleOrder;
    }
}