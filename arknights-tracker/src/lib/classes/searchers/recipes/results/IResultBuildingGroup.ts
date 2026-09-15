import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";

export interface IResultBuildingGroup<
    TBuilding extends IBuilding,
    TRecipe extends IBuildingRecipe<TBuilding, IItem, IItem> = IBuildingRecipe<TBuilding, IItem, IItem>,
> {
    get building(): TBuilding;
    get list(): readonly TRecipe[];
}