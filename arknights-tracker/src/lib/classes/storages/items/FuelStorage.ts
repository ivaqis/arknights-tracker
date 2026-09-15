import { Fuel } from "$lib/classes/gameData/items/fuel/Fuel";
import type { IFuel } from "$lib/classes/gameData/items/fuel/IFuel";
import { GameDataStorage } from "$lib/classes/storages/GameDataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IFuelStorage } from "$lib/classes/storages/items/IFuelStorage";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { FuelData } from "$lib/data/types/items/FuelData";

export class FuelStorage extends GameDataStorage<IFuel> implements IFuelStorage {

    public constructor(itemStorage: IItemStorage, fuelDataStorage: IDataStorage<FuelData>) {
        const list = FuelStorage.getList(itemStorage, fuelDataStorage);

        super(list);
    }

    private static getList(itemStorage: IItemStorage, fuelDataStorage: IDataStorage<FuelData>): IFuel[] {
        const result: IFuel[] = [];

        for (const fuelData of fuelDataStorage.list) {
            const item = itemStorage.byGameId.getOrThrow(fuelData.id);

            result.push(Fuel.createFromItem(item, fuelData.powerProvide, fuelData.progressRound));
        }

        return result;
    }
}