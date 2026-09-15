import type { IPowerStation } from "$lib/classes/gameData/buildings/powerStations/IPowerStation";
import type { IFuel } from "$lib/classes/gameData/items/fuel/IFuel";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";

export interface IPowerRecipe extends IBuildingRecipe<IPowerStation, IFuel, IItem> {
    get powerProvide(): number;
}