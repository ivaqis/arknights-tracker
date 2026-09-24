import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
import { GasEnvStorage } from "$lib/classes/storages/gasEnv/GasEnvStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { gasEnvDataStorage } from "$lib/dataStorages/gasEnv/gasEnvDataStorage";

export const gasEnvStorage: IDataStorage<IGasEnv> = GasEnvStorage.create(gasEnvDataStorage.list);