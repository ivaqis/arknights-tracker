import type { IFood } from "$lib/classes/gameData/items/food/IFood";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";
import { FoodStorage } from "$lib/classes/storages/items/FoodStorage";
import { equipableItemDataStorage } from "$lib/dataStorages/items/equipableItemDataStorage";
import { foodDataStorage } from "$lib/dataStorages/items/foodDataStorage";
import { itemStorage } from "$lib/dataStorages/items/itemStorage";

export const foodStorage: IGameDataStorage<IFood> = FoodStorage.create(foodDataStorage.list, equipableItemDataStorage, itemStorage);