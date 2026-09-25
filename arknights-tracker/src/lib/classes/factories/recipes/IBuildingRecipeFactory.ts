import type { IRecipeFactory } from "$lib/classes/factories/recipes/IRecipeFactory";
import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";
import type { RecipeData } from "$lib/data/types/crafts/RecipeData";

export interface IBuildingRecipeFactory<
    TData extends RecipeData,
    TRecipe extends IBuildingRecipe<TBuilding, TIngredient, TOutcome>,
    TBuilding extends IBuilding,
    TIngredient extends IItem = IItem,
    TOutcome extends IItem = IItem
>
    extends IRecipeFactory<TData, TRecipe, TIngredient, TOutcome> {}