import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";

export interface IRecipeSearchResult<
    TRecipe extends IRecipe<IItem, IItem> = IRecipe<IItem, IItem>,
> {
    get list(): readonly TRecipe[];
    get isEmpty(): boolean;
}