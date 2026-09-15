import type { IMiner } from "$lib/classes/gameData/buildings/miners/IMiner";
import type { IMinerRecipe } from "$lib/classes/gameData/recipes/IMinerRecipe";
import type { IMinerRecipeSearcher } from "$lib/classes/searchers/recipes/IMinerRecipeSearcher";
import { BuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/BuildingRecipeSearchResult";
import type { IBuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IBuildingRecipeSearchResult";
import type { IMinerStorage } from "$lib/classes/storages/buildings/IMinerStorage";

export class MinerRecipeSearcher implements IMinerRecipeSearcher {
    private readonly _minerStorage: IMinerStorage;

    public constructor(minerStorage: IMinerStorage) {
        this._minerStorage = minerStorage;
    }

    public searchByBuilding(buildingId: string): IBuildingRecipeSearchResult<IMiner, IMinerRecipe> {
        const miner = this._minerStorage.byGameId.get(buildingId);

        if (!miner) {
            return new BuildingRecipeSearchResult([]);
        }

        const recipes = miner.mineableList.values()
            .map(m => miner.getRecipe(m.miningItem.gameId))
            .filter(r => r !== null)
            .toArray();

        return new BuildingRecipeSearchResult(recipes);
    }

    public searchByItemAsIncome(itemId: string): IBuildingRecipeSearchResult<IMiner, IMinerRecipe> {
        const miners = this._minerStorage.byConsumeItemId.get(itemId);

        if (!miners) {
            return new BuildingRecipeSearchResult([]);
        }

        const recipes: IMinerRecipe[] = [];

        for (const miner of miners) {
            recipes.push(...this.getRecipesByConsumeItem(miner, itemId));
        }

        return new BuildingRecipeSearchResult(recipes);
    }

    public searchByItemAsOutcome(itemId: string): IBuildingRecipeSearchResult<IMiner, IMinerRecipe> {
        const miners = this._minerStorage.byMineableId.get(itemId);

        if (!miners) {
            return new BuildingRecipeSearchResult([]);
        }

        const recipes: IMinerRecipe[] = miners.values()
            .map(miner => miner.getRecipe(itemId))
            .filter(r => r !== null)
            .toArray();

        return new BuildingRecipeSearchResult(recipes);
    }

    private getRecipesByConsumeItem(miner: IMiner, consumeItemId: string): IteratorObject<IMinerRecipe, undefined, unknown> {
        return miner.mineableList.values()
            .filter(m => m.consumeItem?.item.gameId === consumeItemId)
            .map(m => miner.getRecipe(m.miningItem.gameId))
            .filter(r => r !== null);
    }
}