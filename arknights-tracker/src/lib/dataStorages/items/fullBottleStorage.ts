import { FullBottleStorage } from "$lib/classes/storages/items/FullBottleStorage";
import type { IFullBottleStorage } from "$lib/classes/storages/items/IFullBottleStorage";
import { fullBottleDataStorage } from "$lib/dataStorages/items/fullBottleDataStorage";
import { itemStorage } from "$lib/dataStorages/items/itemStorage";

export const fullBottleStorage: IFullBottleStorage = new FullBottleStorage(itemStorage, fullBottleDataStorage);