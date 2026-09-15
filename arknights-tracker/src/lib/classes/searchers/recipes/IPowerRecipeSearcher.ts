import type { IPowerStation } from "$lib/classes/gameData/buildings/powerStations/IPowerStation";
import type { IPowerRecipe } from "$lib/classes/gameData/recipes/IPowerRecipe";
import type { IBuildingRecipeSearcher } from "$lib/classes/searchers/recipes/IBuildingRecipeSearcher";
import type { IBuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IBuildingRecipeSearchResult";

export interface IPowerRecipeSearcher extends IBuildingRecipeSearcher<IBuildingRecipeSearchResult<IPowerStation, IPowerRecipe>> {}