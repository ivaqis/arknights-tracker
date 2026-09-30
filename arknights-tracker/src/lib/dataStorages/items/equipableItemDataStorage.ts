import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { equipableItems } from "$lib/data/items/equipableItems";
import type { EquipableItemData } from "$lib/data/types/items/EquipableItemData";

export const equipableItemDataStorage: IDataStorage<EquipableItemData> = new DataStorage(Object.values(equipableItems));