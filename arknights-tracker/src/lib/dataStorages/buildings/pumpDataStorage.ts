import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { pumps } from "$lib/data/buildings/pumps";
import type { PumpData } from "$lib/data/types/buildings/PumpData";

export const pumpDataStorage: IDataStorage<PumpData> = new DataStorage(Object.values(pumps));