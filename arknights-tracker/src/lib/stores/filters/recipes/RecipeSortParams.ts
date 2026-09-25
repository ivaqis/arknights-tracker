import { ItemFieldComparatorName } from "$lib/classes/comparators/items/ItemFieldComparatorName";
import type { RecipeSortParamMap } from "$lib/stores/filters/recipes/RecipeSortParamMap";

export interface RecipeSortParams {
    sortFieldOrder: ItemFieldComparatorName[];
    sortFieldParams: RecipeSortParamMap;
}