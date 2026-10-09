import type { LocaleOrder } from "$lib/classes/comparators/LocaleOrder";
import type { EquipmentComparatorName } from "$lib/classes/comparators/names/EquipmentComparatorName";
import type { Rarity } from "$lib/classes/Rarity";
import type { SortDirection } from "$lib/classes/SortDirection";

export interface EquipmentSortParams {
    sortFieldOrder: EquipmentComparatorName[];
    sortFieldParams: {
        [EquipmentComparatorName.RARITY]: Rarity[];
        [EquipmentComparatorName.PACK]: string[];
        [EquipmentComparatorName.PART_TYPE]: string[];
        [EquipmentComparatorName.LOCALE_NAME]: LocaleOrder;
        [EquipmentComparatorName.LEVEL]: SortDirection;
    }
}