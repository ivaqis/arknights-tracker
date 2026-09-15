import type { RecipeSelectedFilterMap } from "$lib/stores/filters/recipes/RecipeSelectedFilterMap";
import type { RecipeSortParams } from "$lib/stores/filters/recipes/RecipeSortParams";
import type { Writable } from "svelte/store";

declare function getDefaultItemSortParams(): RecipeSortParams;

declare const itemFilters: Writable<RecipeSelectedFilterMap>;
declare const itemSearch: Writable<string>;
declare const itemSortParams: Writable<RecipeSortParams>;
declare const itemGroupMode: Writable<boolean>;