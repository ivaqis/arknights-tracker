import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { RecipeData } from "$lib/data/types/crafts/RecipeData";

export interface IRecipeDataStorage<TRecipe extends RecipeData> {
    get asIncome(): IReadonlyDataMap<string, readonly TRecipe[]>;
    get asOutcome(): IReadonlyDataMap<string, readonly TRecipe[]>;
}