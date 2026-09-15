import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { buildings } from "$lib/data/buildings/buildings";
import type { BuildingData } from "$lib/data/types/buildings/BuildingData";

export const buildingDataStorage: IDataStorage<BuildingData> = new DataStorage(Object.values(buildings));