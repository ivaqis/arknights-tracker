import type { ICrafter } from "$lib/classes/gameData/buildings/crafters/ICrafter";
import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";
import type { IBuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IBuildingRecipeSearchResult";
import type { IResultCrafterModeGroup } from "$lib/classes/searchers/recipes/results/IResultCrafterModeGroup";

export interface IMachineCraftSearchResult
    extends IBuildingRecipeSearchResult<ICrafter, IMachineCraft> {

    groupByFormulaGroup(): ReadonlyMap<string, IResultCrafterModeGroup>
}