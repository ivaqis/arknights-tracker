import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { fullBottles } from "$lib/data/items/fullBottles";
import type { FullBottleData } from "$lib/data/types/items/FullBottleData";

export const fullBottleDataStorage: IDataStorage<FullBottleData> = new DataStorage(Object.values(fullBottles));