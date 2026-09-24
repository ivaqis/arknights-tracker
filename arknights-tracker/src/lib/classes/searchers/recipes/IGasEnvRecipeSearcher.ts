import type { IVaporizer } from "$lib/classes/gameData/buildings/vaporizers/IVaporizer";
import type { IGasEnvRecipe } from "$lib/classes/gameData/recipes/IGasEnvRecipe";
import type { IBuildingRecipeSearcher } from "$lib/classes/searchers/recipes/IBuildingRecipeSearcher";
import type { IBuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IBuildingRecipeSearchResult";

export interface IGasEnvRecipeSearcher extends IBuildingRecipeSearcher<IBuildingRecipeSearchResult<IVaporizer, IGasEnvRecipe>> {
    searchByGasEnv(gasEnvId: string): IBuildingRecipeSearchResult<IVaporizer, IGasEnvRecipe>;
}