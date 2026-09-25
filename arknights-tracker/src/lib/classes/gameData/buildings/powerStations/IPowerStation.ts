import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IFuel } from "$lib/classes/gameData/items/fuel/IFuel";
import type { IPowerRecipe } from "$lib/classes/gameData/recipes/IPowerRecipe";

export interface IPowerStation extends IBuilding {
    get msPerRound(): number;
    get enableFuelList(): readonly IFuel[];
    getEnableFuel(fuelId: string): IFuel | null;
    isFuelEnabled(fuelId: string): boolean;

    getRecipe(fuelId: string): IPowerRecipe | null;
}