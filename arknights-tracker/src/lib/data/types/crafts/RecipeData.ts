import type { ItemStackData } from "$lib/classes/gameData/items/ItemStackData";

export interface RecipeData {
    readonly ingredients: readonly ItemStackData[];
    readonly outcomes: readonly ItemStackData[];
}