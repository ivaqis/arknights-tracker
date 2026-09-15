import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";
import { AResultBuildingGroup } from "$lib/classes/searchers/recipes/results/AResultBuildingGroup";
import type { IResultBuildingGroup } from "$lib/classes/searchers/recipes/results/IResultBuildingGroup";

export class ResultBuildingGroup<
    TBuilding extends IBuilding,
    TRecipe extends IBuildingRecipe<TBuilding, IItem, IItem>,
>
    extends AResultBuildingGroup<TBuilding, TRecipe>
    implements IResultBuildingGroup<TBuilding, TRecipe> {

    private readonly _list: readonly TRecipe[];

    public constructor(building: TBuilding, list: readonly TRecipe[]) {
        super(building);

        this._list = list;
    }

    public get list(): readonly TRecipe[] {
        return this._list;
    }
}