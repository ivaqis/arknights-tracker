import type { IMachineCraftFactory } from "$lib/classes/factories/recipes/IMachineCraftFactory";
import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";
import type { IMachineCraftSearcher } from "$lib/classes/searchers/recipes/IMachineCraftSearcher";
import type { IMachineCraftSearchResult } from "$lib/classes/searchers/recipes/results/IMachineCraftSearchResult";
import { MachineCraftSearchResult } from "$lib/classes/searchers/recipes/results/MachineCraftSearchResult";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IBuildingRecipeDataStorage } from "$lib/classes/storages/recipes/IBuildingRecipeDataStorage";
import type { MachineCraftData } from "$lib/data/types/crafts/MachineCraftData";

export class MachineCraftSearcher implements IMachineCraftSearcher {
    private readonly _mappedCraftStorage: IBuildingRecipeDataStorage<MachineCraftData>;
    private readonly _craftFactory: IMachineCraftFactory;
    private readonly _craftDataStorage: IDataStorage<MachineCraftData>;

    public constructor(mappedCraftStorage: IBuildingRecipeDataStorage<MachineCraftData>, craftFactory: IMachineCraftFactory, craftDataStorage: IDataStorage<MachineCraftData>) {
        this._mappedCraftStorage = mappedCraftStorage;
        this._craftFactory = craftFactory;
        this._craftDataStorage = craftDataStorage;
    }

    public findRecipe(recipeId: string): IMachineCraft | null {
        const data = this._craftDataStorage.byId.get(recipeId);

        if (!data) {
            return null;
        }

        return this._craftFactory.create(data);
    }

    public searchByBuilding(buildingId: string): IMachineCraftSearchResult {
        const list = this._mappedCraftStorage.byBuildingId.get(buildingId);

        return this.getResult(list);
    }

    public searchByItemAsIncome(itemId: string): IMachineCraftSearchResult {
        const list = this._mappedCraftStorage.asIncome.get(itemId);

        return this.getResult(list);
    }

    public searchByItemAsOutcome(itemId: string): IMachineCraftSearchResult {
        const list = this._mappedCraftStorage.asOutcome.get(itemId);

        return this.getResult(list);
    }

    private getResult(list: readonly MachineCraftData[] | undefined) {
        if (!list) {
            return new MachineCraftSearchResult([]);
        }

        const recipes = list.map(craft => this._craftFactory.create(craft));

        return new MachineCraftSearchResult(recipes);
    }
}