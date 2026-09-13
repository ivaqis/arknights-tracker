import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";
import type { RecipeType } from "$lib/classes/gameData/recipes/RecipeType";

export interface INodeRecipe<T extends RecipeType, TRecipe extends IRecipe<IItem, IItem>> {
    get type(): T;
    get recipe(): TRecipe;
}