import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IFullBottle } from "$lib/classes/gameData/items/fullBottles/IFullBottle";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";

export interface IFullBottleStorage extends IGameDataStorage<IFullBottle> {
    get byEmptyBottleId(): IReadonlyDataMap<string, IFullBottle[]>;
    get byLiquidId(): IReadonlyDataMap<string, IFullBottle[]>;
}