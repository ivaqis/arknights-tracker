import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";

export interface INaturalRecipe<TBuilding extends IBuilding, TIngredient extends IItem, TOutcome extends IItem>
    extends IBuildingRecipe<TBuilding, TIngredient, TOutcome> {
    get resourcePoint(): IResourcePoint;
}