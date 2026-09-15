import type { IManualCraftFactory } from "$lib/classes/factories/recipes/IManualCraftFactory";
import type { IManualCraft } from "$lib/classes/gameData/recipes/IManualCraft";
import type { IManualCraftSearcher } from "$lib/classes/searchers/recipes/IManualCraftSearcher";
import type { IRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IRecipeSearchResult";
import { RecipeSearchResult } from "$lib/classes/searchers/recipes/results/RecipeSearchResult";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IRecipeDataStorage } from "$lib/classes/storages/recipes/IRecipeDataStorage";
import type { ManualCraftData } from "$lib/data/types/crafts/ManualCraftData";

export class ManualCraftSearcher implements IManualCraftSearcher {
    private readonly _mappedCraftStorage: IRecipeDataStorage<ManualCraftData>;
    private readonly _craftFactory: IManualCraftFactory;
    private readonly _craftDataStorage: IDataStorage<ManualCraftData>;

    public constructor(mappedCraftStorage: IRecipeDataStorage<ManualCraftData>, craftFactory: IManualCraftFactory, craftDataStorage: IDataStorage<ManualCraftData>) {
        this._mappedCraftStorage = mappedCraftStorage;
        this._craftFactory = craftFactory;
        this._craftDataStorage = craftDataStorage;
    }

    public findRecipe(recipeId: string): IManualCraft | null {
        const data = this._craftDataStorage.byId.get(recipeId);

        if (!data) {
            return null;
        }

        return this._craftFactory.create(data);
    }

    public searchByItemAsIncome(itemId: string): IRecipeSearchResult<IManualCraft> {
        const craftDataList = this._mappedCraftStorage.asIncome.get(itemId);

        return this.getResult(craftDataList);
    }

    public searchByItemAsOutcome(itemId: string): IRecipeSearchResult<IManualCraft> {
        const craftDataList = this._mappedCraftStorage.asOutcome.get(itemId);

        return this.getResult(craftDataList);
    }

    private getResult(list: readonly ManualCraftData[] | undefined) {
        if (!list) {
            return new RecipeSearchResult([]);
        }

        const recipes = list.map(craft => this._craftFactory.create(craft));

        return new RecipeSearchResult(recipes);
    }
}