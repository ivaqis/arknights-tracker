import type { IPump } from "$lib/classes/gameData/buildings/pumps/IPump";
import type { IPumpRecipe } from "$lib/classes/gameData/recipes/IPumpRecipe";
import type { IPumpRecipeSearcher } from "$lib/classes/searchers/recipes/IPumpRecipeSearcher";
import { BuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/BuildingRecipeSearchResult";
import type { IBuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IBuildingRecipeSearchResult";
import type { IPumpStorage } from "$lib/classes/storages/buildings/IPumpStorage";

export class PumpRecipeSearcher implements IPumpRecipeSearcher {
    private readonly _pumpStorage: IPumpStorage;

    public constructor(pumpStorage: IPumpStorage) {
        this._pumpStorage = pumpStorage;
    }

    public searchByBuilding(buildingId: string): IBuildingRecipeSearchResult<IPump, IPumpRecipe> {
        const pump = this._pumpStorage.byGameId.get(buildingId);

        if (!pump) {
            return new BuildingRecipeSearchResult([]);
        }

        const recipes = pump.enableLiquids.values()
            .map(liquid => pump.getRecipe(liquid.item.gameId))
            .filter(r => r !== null)
            .toArray();

        return new BuildingRecipeSearchResult(recipes);
    }

    public searchByItemAsIncome(itemId: string): IBuildingRecipeSearchResult<IPump, IPumpRecipe> {
        return new BuildingRecipeSearchResult([]);
    }

    public searchByItemAsOutcome(itemId: string): IBuildingRecipeSearchResult<IPump, IPumpRecipe> {
        const pumps = this._pumpStorage.byEnableLiquidId.get(itemId);

        if (!pumps) {
            return new BuildingRecipeSearchResult([]);
        }

        const recipes = pumps.values()
            .map(pump => pump.getRecipe(itemId))
            .filter(r => r !== null)
            .toArray();

        return new BuildingRecipeSearchResult(recipes);
    }
}