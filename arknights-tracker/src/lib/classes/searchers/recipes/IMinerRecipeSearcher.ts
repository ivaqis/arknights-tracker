import type { IMiner } from "$lib/classes/gameData/buildings/miners/IMiner";
import type { IMinerRecipe } from "$lib/classes/gameData/recipes/IMinerRecipe";
import type { IBuildingRecipeSearcher } from "$lib/classes/searchers/recipes/IBuildingRecipeSearcher";
import type { IBuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IBuildingRecipeSearchResult";

export interface IMinerRecipeSearcher extends IBuildingRecipeSearcher<IBuildingRecipeSearchResult<IMiner, IMinerRecipe>> {}