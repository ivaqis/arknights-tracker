import type { ICrafter } from "$lib/classes/gameData/buildings/crafters/ICrafter";
import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";
import type { IMachineCraftSearchResult } from "$lib/classes/searchers/recipes/results/IMachineCraftSearchResult";
import type { IResultBuildingGroup } from "$lib/classes/searchers/recipes/results/IResultBuildingGroup";
import type { IResultCrafterModeGroup } from "$lib/classes/searchers/recipes/results/IResultCrafterModeGroup";
import { RecipeSearchResult } from "$lib/classes/searchers/recipes/results/RecipeSearchResult";
import { ResultBuildingGroup } from "$lib/classes/searchers/recipes/results/ResultBuildingGroup";
import { ResultCrafterModeGroup } from "$lib/classes/searchers/recipes/results/ResultCrafterModeGroup";
import { getMap, getMappedList } from "$lib/utils/collectionUtils";

export class MachineCraftSearchResult
    extends RecipeSearchResult<IMachineCraft>
    implements IMachineCraftSearchResult {

    public constructor(list: IMachineCraft[]) {
        super(list);
    }

    public groupByBuilding(): ReadonlyMap<string, IResultBuildingGroup<ICrafter, IMachineCraft>> {
        const recipeMap = getMappedList(this.list, r => r.building.gameId);
        const groupList = recipeMap.values()
            .map(list => new ResultBuildingGroup(list[0].building, list));

        return getMap(groupList, item => item.building.gameId);
    }

    public groupByFormulaGroup(): ReadonlyMap<string, IResultCrafterModeGroup> {
        const recipeMap = getMappedList(this.list, r => r.formulaGroup.formulaGroupId);
        const groupList = recipeMap.values()
            .map(list => new ResultCrafterModeGroup(list[0].building, list, list[0].formulaGroup));

        return getMap(groupList, item => item.mode.formulaGroupId);
    }
}