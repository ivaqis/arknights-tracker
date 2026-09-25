import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";
import type { RecipeData } from "$lib/data/types/crafts/RecipeData";

export interface IRecipeFactory<
    TData extends RecipeData,
    TRecipe extends IRecipe<TIngredient, TOutcome>,
    TIngredient extends IItem = IItem,
    TOutcome extends IItem = IItem
> {
    create(recipeData: TData): TRecipe;
}