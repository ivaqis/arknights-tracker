import type { IPowerStation } from "$lib/classes/gameData/buildings/powerStations/IPowerStation";
import type { IPowerRecipe } from "$lib/classes/gameData/recipes/IPowerRecipe";
import type { IPowerRecipeSearcher } from "$lib/classes/searchers/recipes/IPowerRecipeSearcher";
import { BuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/BuildingRecipeSearchResult";
import type { IBuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IBuildingRecipeSearchResult";
import type { IPowerStationStorage } from "$lib/classes/storages/buildings/IPowerStationStorage";

export class PowerRecipeSearcher implements IPowerRecipeSearcher {
    private readonly _powerStationStorage: IPowerStationStorage;

    public constructor(powerStationStorage: IPowerStationStorage) {
        this._powerStationStorage = powerStationStorage;
    }

    public searchByBuilding(buildingId: string): IBuildingRecipeSearchResult<IPowerStation, IPowerRecipe> {
        const powerStation = this._powerStationStorage.byGameId.get(buildingId);

        if (!powerStation) {
            return new BuildingRecipeSearchResult([]);
        }

        const recipes = powerStation.enableFuelList.values()
            .map(fuel => powerStation.getRecipe(fuel.gameId))
            .filter(r => r !== null)
            .toArray();

        return new BuildingRecipeSearchResult(recipes);
    }

    public searchByItemAsIncome(itemId: string): IBuildingRecipeSearchResult<IPowerStation, IPowerRecipe> {
        const stations = this._powerStationStorage.byEnableFuelId.get(itemId);

        if (!stations) {
            return new BuildingRecipeSearchResult([]);
        }

        const recipes = stations.values()
            .map(station => station.getRecipe(itemId))
            .filter(r => r !== null)
            .toArray();

        return new BuildingRecipeSearchResult(recipes);
    }

    public searchByItemAsOutcome(itemId: string): IBuildingRecipeSearchResult<IPowerStation, IPowerRecipe> {
        return new BuildingRecipeSearchResult([]);
    }
}