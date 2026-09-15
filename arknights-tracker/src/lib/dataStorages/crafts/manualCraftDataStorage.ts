import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { manualCrafts } from "$lib/data/crafts/manualCrafts";
import type { ManualCraftData } from "$lib/data/types/crafts/ManualCraftData";

export const manualCraftDataStorage: IDataStorage<ManualCraftData> = new DataStorage(Object.values(manualCrafts));