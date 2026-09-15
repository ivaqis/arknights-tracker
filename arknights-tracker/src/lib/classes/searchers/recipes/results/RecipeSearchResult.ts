import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";
import type { IRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IRecipeSearchResult";

export class RecipeSearchResult<
    TRecipe extends IRecipe<IItem, IItem> = IRecipe<IItem, IItem>,
> implements IRecipeSearchResult<TRecipe> {
    private readonly _list: readonly TRecipe[];

    public constructor(list: readonly TRecipe[]) {
        this._list = list;
    }

    public get list(): readonly TRecipe[] {
        return this._list;
    }

    public get isEmpty(): boolean {
        return this._list.length === 0;
    }
}