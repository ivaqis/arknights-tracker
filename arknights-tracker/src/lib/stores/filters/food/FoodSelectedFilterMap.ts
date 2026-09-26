import type { FoodFilterGroup, FoodFilterValue } from "$lib/stores/filters/food/FoodFilterValueMap";

export type FoodSelectedFilterMap = {
    [K in FoodFilterGroup]?: Set<FoodFilterValue<K>>;
}