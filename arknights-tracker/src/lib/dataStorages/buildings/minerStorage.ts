import type { IMinerStorage } from "$lib/classes/storages/buildings/IMinerStorage";
import { MinerStorage } from "$lib/classes/storages/buildings/MinerStorage";
import { buildingStorage } from "$lib/dataStorages/buildings/buildingStorage";
import { minerDataStorage } from "$lib/dataStorages/buildings/minerDataStorage";
import { itemStorage } from "$lib/dataStorages/items/itemStorage";
import { resourcePointStorage } from "$lib/dataStorages/items/resourcePointStorage";

export const minerStorage: IMinerStorage = MinerStorage.createMinerStorage(minerDataStorage, buildingStorage, itemStorage, resourcePointStorage);