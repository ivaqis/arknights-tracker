import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { gasEnv } from "$lib/data/items/gasEnv";
import type { GasEnvData } from "$lib/data/types/items/GasEnvData";

export const gasEnvDataStorage: IDataStorage<GasEnvData> = new DataStorage(Object.values(gasEnv));