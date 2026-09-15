import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";
import type { IRecipeSearcher } from "$lib/classes/searchers/recipes/IRecipeSearcher";
import type { IRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IRecipeSearchResult";

export interface IIdentifiableRecipeSearcher<
    TRecipe extends IRecipe<IItem, IItem> = IRecipe<IItem, IItem>,
    TResult extends IRecipeSearchResult<TRecipe> = IRecipeSearchResult<TRecipe>
>
    extends IRecipeSearcher<TResult> {

    findRecipe(recipeId: string): TRecipe | null;
}