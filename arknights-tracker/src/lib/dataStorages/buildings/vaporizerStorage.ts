import type { IVaporizerStorage } from "$lib/classes/storages/buildings/IVaporizerStorage";
import { VaporizerStorage } from "$lib/classes/storages/buildings/VaporizerStorage";
import { buildingStorage } from "$lib/dataStorages/buildings/buildingStorage";
import { vaporizerDataStorage } from "$lib/dataStorages/buildings/vaporizerDataStorage";
import { gasEnvStorage } from "$lib/dataStorages/gasEnv/gasEnvStorage";
import { itemStorage } from "$lib/dataStorages/items/itemStorage";

export const vaporizerStorage: IVaporizerStorage = VaporizerStorage.createVaporizerStorage(vaporizerDataStorage, buildingStorage, itemStorage, gasEnvStorage);