import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";

export class Recipe<TIngredient extends IItem, TOutcome extends IItem> implements IRecipe<TIngredient, TOutcome> {
    private readonly _ingredients: readonly IItemStack<TIngredient>[];
    private readonly _outcomes: readonly IItemStack<TOutcome>[];

    public constructor(ingredients: readonly IItemStack<TIngredient>[], outcomes: readonly IItemStack<TOutcome>[]) {
        this._ingredients = ingredients;
        this._outcomes = outcomes;
    }

    public get ingredients(): readonly IItemStack<TIngredient>[] {
        return this._ingredients;
    }

    public get outcomes(): readonly IItemStack<TOutcome>[] {
        return this._outcomes;
    }
}