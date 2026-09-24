import type { IVaporizer } from "$lib/classes/gameData/buildings/vaporizers/IVaporizer";
import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import { BuildingRecipe } from "$lib/classes/gameData/recipes/BuildingRecipe";
import type { IGasEnvRecipe } from "$lib/classes/gameData/recipes/IGasEnvRecipe";

export class GasEnvRecipe extends BuildingRecipe<IVaporizer, IItem, IItem> implements IGasEnvRecipe {
    private readonly _gasEnv: IGasEnv;

    public constructor(ingredients: IItemStack[], building: IVaporizer, processTimeMs: number, gasEnv: IGasEnv) {
        super(ingredients, [], building, processTimeMs);

        this._gasEnv = gasEnv;
    }

    public get gasEnv(): IGasEnv {
        return this._gasEnv;
    }
}