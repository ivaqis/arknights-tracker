import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { craftableItems } from "$lib/data/items/craftableItems";
import type { CraftableItemData } from "$lib/data/types/items/CraftableItemData";

export const craftableItemDataStorage: IDataStorage<CraftableItemData> = new DataStorage(Object.values(craftableItems));