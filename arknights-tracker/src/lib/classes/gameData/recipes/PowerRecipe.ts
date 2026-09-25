import type { IPowerStation } from "$lib/classes/gameData/buildings/powerStations/IPowerStation";
import type { IFuel } from "$lib/classes/gameData/items/fuel/IFuel";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import { BuildingRecipe } from "$lib/classes/gameData/recipes/BuildingRecipe";
import type { IPowerRecipe } from "$lib/classes/gameData/recipes/IPowerRecipe";

export class PowerRecipe extends BuildingRecipe<IPowerStation, IFuel, IItem> implements IPowerRecipe {
    private readonly _powerProvide: number;

    public get processTimeMs(): number {
        return super.processTimeMs;
    }

    public constructor(ingredients: IItemStack<IFuel>[], building: IPowerStation, processTimeMs: number, powerProvide: number) {
        super(ingredients, [], building, processTimeMs);
        this._powerProvide = powerProvide;
    }

    public get powerProvide(): number {
        return this._powerProvide;
    }
}