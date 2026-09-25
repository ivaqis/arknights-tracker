import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";

export interface IRecipe<TIngredient extends IItem, TOutcome extends IItem> {
    get ingredients(): readonly IItemStack<TIngredient>[];
    get outcomes(): readonly IItemStack<TOutcome>[];
}