import type { IPumpStorage } from "$lib/classes/storages/buildings/IPumpStorage";
import { PumpStorage } from "$lib/classes/storages/buildings/PumpStorage";
import { buildingStorage } from "$lib/dataStorages/buildings/buildingStorage";
import { pumpDataStorage } from "$lib/dataStorages/buildings/pumpDataStorage";
import { itemStorage } from "$lib/dataStorages/items/itemStorage";
import { resourcePointStorage } from "$lib/dataStorages/items/resourcePointStorage";

export const pumpStorage: IPumpStorage = PumpStorage.createPumpStorage(pumpDataStorage, buildingStorage, itemStorage, resourcePointStorage);