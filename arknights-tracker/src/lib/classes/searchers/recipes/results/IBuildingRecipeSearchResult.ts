import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";
import type { IRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IRecipeSearchResult";
import type { IResultBuildingGroup } from "$lib/classes/searchers/recipes/results/IResultBuildingGroup";

export interface IBuildingRecipeSearchResult<
    TBuilding extends IBuilding,
    TRecipe extends IBuildingRecipe<TBuilding, IItem, IItem> = IBuildingRecipe<TBuilding, IItem, IItem>,
    TGroup extends IResultBuildingGroup<TBuilding, TRecipe> = IResultBuildingGroup<TBuilding, TRecipe>,
> extends IRecipeSearchResult<TRecipe> {
    groupByBuilding(): ReadonlyMap<string, TGroup>;
}