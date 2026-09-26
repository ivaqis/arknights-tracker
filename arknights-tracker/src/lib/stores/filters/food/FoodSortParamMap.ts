import { FoodFieldComparatorName } from "$lib/classes/comparators/items/FoodFieldComparatorName";
import type { LocaleOrder } from "$lib/classes/comparators/LocaleOrder";
import type { FoodFilterGroup, FoodFilterValue } from "$lib/stores/filters/food/FoodFilterValueMap";

export type FoodSortParamMap = {
    [K in FoodFilterGroup]: FoodFilterValue<K>[];
} & {
    [FoodFieldComparatorName.LOCALE]: LocaleOrder;
}

export type FoodSortFieldParamGroup = keyof FoodSortParamMap;