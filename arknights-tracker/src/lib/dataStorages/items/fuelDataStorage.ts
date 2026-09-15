import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { fuel } from "$lib/data/items/fuel";
import type { FuelData } from "$lib/data/types/items/FuelData";

export const fuelDataStorage: IDataStorage<FuelData> = new DataStorage(Object.values(fuel));