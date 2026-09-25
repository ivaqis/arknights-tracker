import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { crafters } from "$lib/data/buildings/crafters";
import type { CrafterData } from "$lib/data/types/buildings/CrafterData";

export const crafterDataStorage: IDataStorage<CrafterData> = new DataStorage(Object.values(crafters));