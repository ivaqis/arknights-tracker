import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";
import type { IBuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IBuildingRecipeSearchResult";
import type { IResultBuildingGroup } from "$lib/classes/searchers/recipes/results/IResultBuildingGroup";
import { RecipeSearchResult } from "$lib/classes/searchers/recipes/results/RecipeSearchResult";
import { ResultBuildingGroup } from "$lib/classes/searchers/recipes/results/ResultBuildingGroup";
import { getMap, getMappedList } from "$lib/utils/collectionUtils";

export class BuildingRecipeSearchResult<
    TBuilding extends IBuilding,
    TRecipe extends IBuildingRecipe<TBuilding, IItem, IItem>,
>
    extends RecipeSearchResult<TRecipe>
    implements IBuildingRecipeSearchResult<TBuilding, TRecipe, IResultBuildingGroup<TBuilding, TRecipe>> {

    public constructor(list: readonly TRecipe[]) {
        super(list);
    }

    public groupByBuilding(): ReadonlyMap<string, IResultBuildingGroup<TBuilding, TRecipe>> {
        const recipeMap = getMappedList(this.list, r => r.building.gameId);
        const groupList = recipeMap.values()
            .map(list => new ResultBuildingGroup(list[0].building, list));

        return getMap(groupList, item => item.building.gameId);
    }
}