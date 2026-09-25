import { CrafterStorage } from "$lib/classes/storages/buildings/CrafterStorage";
import type { ICrafterStorage } from "$lib/classes/storages/buildings/ICrafterStorage";
import { buildingStorage } from "$lib/dataStorages/buildings/buildingStorage";
import { crafterDataStorage } from "$lib/dataStorages/buildings/crafterDataStorage";

export const crafterStorage: ICrafterStorage = CrafterStorage.createCrafterStorage(crafterDataStorage, buildingStorage);