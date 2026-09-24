import type { IVaporizer } from "$lib/classes/gameData/buildings/vaporizers/IVaporizer";
import type { IGasEnvRecipe } from "$lib/classes/gameData/recipes/IGasEnvRecipe";
import type { IGasEnvRecipeSearcher } from "$lib/classes/searchers/recipes/IGasEnvRecipeSearcher";
import { BuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/BuildingRecipeSearchResult";
import type { IBuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IBuildingRecipeSearchResult";
import type { IVaporizerStorage } from "$lib/classes/storages/buildings/IVaporizerStorage";

export class GasEnvRecipeSearcher implements IGasEnvRecipeSearcher {
    private readonly _vaporizerStorage: IVaporizerStorage;

    public constructor(vaporizerStorage: IVaporizerStorage) {
        this._vaporizerStorage = vaporizerStorage;
    }

    public searchByBuilding(buildingId: string): IBuildingRecipeSearchResult<IVaporizer, IGasEnvRecipe> {
        const vaporizer = this._vaporizerStorage.byGameId.get(buildingId);

        if (!vaporizer) {
            return new BuildingRecipeSearchResult([]);
        }

        const recipes = vaporizer.groups
            .map(group => vaporizer.getGasEnvRecipe(group.gasEnv.id))
            .filter((recipe): recipe is IGasEnvRecipe => recipe !== null);

        return new BuildingRecipeSearchResult(recipes);
    }

    public searchByItemAsIncome(itemId: string): IBuildingRecipeSearchResult<IVaporizer, IGasEnvRecipe> {
        const vaporizers = this._vaporizerStorage.byConsumeItemId.get(itemId);

        if (!vaporizers) {
            return new BuildingRecipeSearchResult([]);
        }

        const recipes = vaporizers
            .map(vaporizer => {
                const group = vaporizer.getGroupByItem(itemId);

                if (!group) {
                    return null;
                }

                return vaporizer.getGasEnvRecipe(group.gasEnv.id);
            })
            .filter((recipe): recipe is IGasEnvRecipe => recipe !== null);

        return new BuildingRecipeSearchResult(recipes);
    }

    public searchByItemAsOutcome(itemId: string): IBuildingRecipeSearchResult<IVaporizer, IGasEnvRecipe> {
        return new BuildingRecipeSearchResult([]);
    }

    public searchByGasEnv(gasEnvId: string): IBuildingRecipeSearchResult<IVaporizer, IGasEnvRecipe> {
        const vaporizers = this._vaporizerStorage.byGasEnvId.get(gasEnvId);

        if (!vaporizers) {
            return new BuildingRecipeSearchResult([]);
        }

        const recipes = vaporizers
            .map(vaporizer => vaporizer.getGasEnvRecipe(gasEnvId))
            .filter((recipe): recipe is IGasEnvRecipe => recipe !== null);

        return new BuildingRecipeSearchResult(recipes);
    }
}