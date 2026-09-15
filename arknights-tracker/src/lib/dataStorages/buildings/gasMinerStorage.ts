import type { IMinerStorage } from "$lib/classes/storages/buildings/IMinerStorage";
import { MinerStorage } from "$lib/classes/storages/buildings/MinerStorage";
import { buildingStorage } from "$lib/dataStorages/buildings/buildingStorage";
import { gasMinerDataStorage } from "$lib/dataStorages/buildings/gasMinerDataStorage";
import { itemStorage } from "$lib/dataStorages/items/itemStorage";
import { resourcePointStorage } from "$lib/dataStorages/items/resourcePointStorage";

export const gasMinerStorage: IMinerStorage = MinerStorage.createMinerStorage(gasMinerDataStorage, buildingStorage, itemStorage, resourcePointStorage);