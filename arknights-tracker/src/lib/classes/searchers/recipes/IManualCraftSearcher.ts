import type { IManualCraft } from "$lib/classes/gameData/recipes/IManualCraft";
import type { IIdentifiableRecipeSearcher } from "$lib/classes/searchers/recipes/IIdentifiableRecipeSearcher";
import type { IRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IRecipeSearchResult";

export interface IManualCraftSearcher extends IIdentifiableRecipeSearcher<IManualCraft, IRecipeSearchResult<IManualCraft>> {}