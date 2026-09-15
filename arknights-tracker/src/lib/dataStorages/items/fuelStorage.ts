import { FuelStorage } from "$lib/classes/storages/items/FuelStorage";
import type { IFuelStorage } from "$lib/classes/storages/items/IFuelStorage";
import { fuelDataStorage } from "$lib/dataStorages/items/fuelDataStorage";
import { itemStorage } from "$lib/dataStorages/items/itemStorage";

export const fuelStorage: IFuelStorage = new FuelStorage(itemStorage, fuelDataStorage);