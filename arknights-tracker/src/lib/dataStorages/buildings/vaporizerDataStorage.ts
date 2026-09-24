import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { vaporizers } from "$lib/data/buildings/vaporizers";
import type { VaporizerData } from "$lib/data/types/buildings/VaporizerData";

export const vaporizerDataStorage: IDataStorage<VaporizerData> = new DataStorage(Object.values(vaporizers));