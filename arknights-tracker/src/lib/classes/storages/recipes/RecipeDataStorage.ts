import { DataMap } from "$lib/classes/collections/DataMap";
import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IRecipeDataStorage } from "$lib/classes/storages/recipes/IRecipeDataStorage";
import type { RecipeData } from "$lib/data/types/crafts/RecipeData";
import { getMappedList } from "$lib/utils/collectionUtils";

export class RecipeDataStorage<TRecipe extends RecipeData> implements IRecipeDataStorage<TRecipe> {
    private readonly _asIncome: IReadonlyDataMap<string, readonly TRecipe[]>;
    private readonly _asOutcome: IReadonlyDataMap<string, readonly TRecipe[]>;

    public constructor(list: readonly TRecipe[]) {
        this._asIncome = new DataMap(getMappedList(list, item => item.ingredients.map(stack => stack.itemId)));
        this._asOutcome = new DataMap(getMappedList(list, item => item.outcomes.map(stack => stack.itemId)));
    }

    public get asIncome(): IReadonlyDataMap<string, readonly TRecipe[]> {
        return this._asIncome;
    }

    public get asOutcome(): IReadonlyDataMap<string, readonly TRecipe[]> {
        return this._asOutcome;
    }
}