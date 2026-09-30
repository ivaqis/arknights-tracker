import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { food } from "$lib/data/items/food";
import type { FoodData } from "$lib/data/types/items/FoodData";

export const foodDataStorage: IDataStorage<FoodData> = new DataStorage(Object.values(food));