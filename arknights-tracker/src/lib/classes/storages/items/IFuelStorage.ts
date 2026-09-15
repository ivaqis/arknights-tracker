import type { IFuel } from "$lib/classes/gameData/items/fuel/IFuel";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";

export interface IFuelStorage extends IGameDataStorage<IFuel> {}