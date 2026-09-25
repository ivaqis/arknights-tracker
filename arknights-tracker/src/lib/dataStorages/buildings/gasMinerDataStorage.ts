import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { gasMiners } from "$lib/data/buildings/gasMiners";
import type { MinerData } from "$lib/data/types/buildings/MinerData";

export const gasMinerDataStorage: IDataStorage<MinerData> = new DataStorage(Object.values(gasMiners));