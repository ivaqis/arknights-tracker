import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IRecipeSearcher } from "$lib/classes/searchers/recipes/IRecipeSearcher";
import type { IBuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IBuildingRecipeSearchResult";

export interface IBuildingRecipeSearcher<
    TResult extends IBuildingRecipeSearchResult<IBuilding> = IBuildingRecipeSearchResult<IBuilding>
>
    extends IRecipeSearcher<TResult> {

    searchByBuilding(buildingId: string): TResult;
}