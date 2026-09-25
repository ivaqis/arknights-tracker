import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IRecipeDataStorage } from "$lib/classes/storages/recipes/IRecipeDataStorage";
import type { RecipeData } from "$lib/data/types/crafts/RecipeData";

export interface IBuildingRecipeDataStorage<TRecipe extends RecipeData> extends IRecipeDataStorage<TRecipe> {
    get byBuildingId(): IReadonlyDataMap<string, readonly TRecipe[]>;
}