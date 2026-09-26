import type { FoodFieldComparatorName } from "$lib/classes/comparators/items/FoodFieldComparatorName";
import type { FoodSortParamMap } from "$lib/stores/filters/food/FoodSortParamMap";

export interface FoodSortParams {
    sortFieldOrder: FoodFieldComparatorName[];
    sortFieldParams: FoodSortParamMap;
}