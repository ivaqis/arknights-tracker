import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";

export interface IBuildingRecipe<TBuilding extends IBuilding, TIngredient extends IItem, TOutcome extends IItem>
    extends IRecipe<TIngredient, TOutcome> {
    get building(): TBuilding;
    get processTimeMs(): number;
}