import { BuildingStorage } from "$lib/classes/storages/buildings/BuildingStorage";
import type { IBuildingStorage } from "$lib/classes/storages/buildings/IBuildingStorage";
import { buildingDataStorage } from "$lib/dataStorages/buildings/buildingDataStorage";
import { itemStorage } from "$lib/dataStorages/items/itemStorage";

export const buildingStorage: IBuildingStorage = BuildingStorage.createBuildingStorage(buildingDataStorage, itemStorage);