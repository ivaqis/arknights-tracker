import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import { ItemStorage } from "$lib/classes/storages/items/ItemStorage";
import { craftableItemDataStorage } from "$lib/dataStorages/items/craftableItemDataStorage";
import { fullBottleDataStorage } from "$lib/dataStorages/items/fullBottleDataStorage";
import { fullJarDataStorage } from "$lib/dataStorages/items/fullJarDataStorage";
import { itemDataStorage } from "$lib/dataStorages/items/itemDataStorage";

export const itemStorage: IItemStorage = new ItemStorage(itemDataStorage, craftableItemDataStorage, fullBottleDataStorage, fullJarDataStorage);