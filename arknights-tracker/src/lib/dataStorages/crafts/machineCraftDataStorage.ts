import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { machineCrafts } from "$lib/data/crafts/machineCrafts";
import type { MachineCraftData } from "$lib/data/types/crafts/MachineCraftData";

export const machineCraftDataStorage: IDataStorage<MachineCraftData> = new DataStorage(Object.values(machineCrafts));