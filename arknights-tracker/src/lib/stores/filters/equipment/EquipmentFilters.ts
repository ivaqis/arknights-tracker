import { EquipmentComparatorName } from "$lib/classes/comparators/names/EquipmentComparatorName";
import type { IFilterSelector } from "$lib/classes/filters/IFilterSelector";
import type { IGroupedFilterSelector } from "$lib/classes/filters/IGroupedFilterSelector";
import type { Rarity } from "$lib/classes/Rarity";

export interface EquipmentFilters {
    [EquipmentComparatorName.RARITY]: IFilterSelector<any, Rarity>;
    [EquipmentComparatorName.PART_TYPE]: IFilterSelector<any>;
    [EquipmentComparatorName.PACK]: IFilterSelector<any>;
    stats_any: IGroupedFilterSelector<any>;
    stats_1: IGroupedFilterSelector<any>;
    stats_2: IGroupedFilterSelector<any>;
    stats_3: IGroupedFilterSelector<any>;
}