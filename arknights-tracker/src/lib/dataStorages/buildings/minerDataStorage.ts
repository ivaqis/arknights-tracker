import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { miners } from "$lib/data/buildings/miners";
import type { MinerData } from "$lib/data/types/buildings/MinerData";

export const minerDataStorage: IDataStorage<MinerData> = new DataStorage(Object.values(miners));