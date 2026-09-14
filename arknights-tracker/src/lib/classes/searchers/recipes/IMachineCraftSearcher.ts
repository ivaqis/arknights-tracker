import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";
import type { IBuildingRecipeSearcher } from "$lib/classes/searchers/recipes/IBuildingRecipeSearcher";
import type { IIdentifiableRecipeSearcher } from "$lib/classes/searchers/recipes/IIdentifiableRecipeSearcher";
import type { IMachineCraftSearchResult } from "$lib/classes/searchers/recipes/results/IMachineCraftSearchResult";

export interface IMachineCraftSearcher
    extends IBuildingRecipeSearcher<IMachineCraftSearchResult>,
        IIdentifiableRecipeSearcher<IMachineCraft, IMachineCraftSearchResult> {
}