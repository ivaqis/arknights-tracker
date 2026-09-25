import type { IPowerStationStorage } from "$lib/classes/storages/buildings/IPowerStationStorage";
import { PowerStationStorage } from "$lib/classes/storages/buildings/PowerStationStorage";
import { buildingStorage } from "$lib/dataStorages/buildings/buildingStorage";
import { powerStationDataStorage } from "$lib/dataStorages/buildings/powerStationDataStorage";
import { fuelStorage } from "$lib/dataStorages/items/fuelStorage";

export const powerStationStorage: IPowerStationStorage = PowerStationStorage.createPowerStationStorage(powerStationDataStorage, buildingStorage, fuelStorage);