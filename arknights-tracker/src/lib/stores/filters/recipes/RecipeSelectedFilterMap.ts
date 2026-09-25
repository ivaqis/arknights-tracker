import type { RecipeFilterGroup, RecipeFilterValue } from "$lib/stores/filters/recipes/RecipeFilterValueMap";

export type RecipeSelectedFilterMap = {
    [K in RecipeFilterGroup]?: Set<RecipeFilterValue<K>>;
}