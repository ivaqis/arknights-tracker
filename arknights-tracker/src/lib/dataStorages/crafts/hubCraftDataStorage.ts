import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { hubCrafts } from "$lib/data/crafts/hubCrafts";
import type { ManualCraftData } from "$lib/data/types/crafts/ManualCraftData";

export const hubCraftDataStorage: IDataStorage<ManualCraftData> = new DataStorage(Object.values(hubCrafts));