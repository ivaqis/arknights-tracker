import type { IVaporizer } from "$lib/classes/gameData/buildings/vaporizers/IVaporizer";
import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";

export interface IGasEnvRecipe extends IBuildingRecipe<IVaporizer, IItem, IItem> {
    get gasEnv(): IGasEnv;
}