import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { machineCraftGroups } from "$lib/data/crafts/machineCraftGroups";
import type { MachineCraftGroupData } from "$lib/data/types/crafts/MachineCraftGroupData";

export const machineCraftGroupDataStorage: IDataStorage<MachineCraftGroupData> = new DataStorage(Object.values(machineCraftGroups));