import type { FoodFilters } from "$lib/stores/filters/food/FoodFilters";
import type { FoodSelectedFilterMap } from "$lib/stores/filters/food/FoodSelectedFilterMap";
import type { FoodSortParams } from "$lib/stores/filters/food/FoodSortParams";
import type { RecipeSelectedFilterMap } from "$lib/stores/filters/recipes/RecipeSelectedFilterMap";
import type { RecipeSortParams } from "$lib/stores/filters/recipes/RecipeSortParams";
import type { Writable } from "svelte/store";

declare function getDefaultItemSortParams(): RecipeSortParams;
declare function getDefaultFoodSortParams(): FoodSortParams;

declare const itemFilters: Writable<RecipeSelectedFilterMap>;
declare const itemSearch: Writable<string>;
declare const itemSortParams: Writable<RecipeSortParams>;
declare const itemGroupMode: Writable<boolean>;

declare const foodFilters: Writable<FoodSelectedFilterMap>;
declare const foodFilters2: FoodFilters;
declare const foodSearch: Writable<string>;
declare const foodSortParams: Writable<FoodSortParams>;