import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { items } from "$lib/data/items/items";
import type { ItemData } from "$lib/data/types/items/ItemData";

export const itemDataStorage: IDataStorage<ItemData> = new DataStorage(Object.values(items));