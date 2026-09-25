import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { powerStations } from "$lib/data/buildings/powerStations";
import type { PowerStationData } from "$lib/data/types/buildings/PowerStationData";

export const powerStationDataStorage: IDataStorage<PowerStationData> = new DataStorage(Object.values(powerStations));