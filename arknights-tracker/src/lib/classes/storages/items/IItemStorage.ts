import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";

export interface IItemStorage extends IGameDataStorage<IItem> {}