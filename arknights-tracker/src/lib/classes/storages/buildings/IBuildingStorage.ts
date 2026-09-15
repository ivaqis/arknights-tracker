import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";

export interface IBuildingStorage<TBuilding extends IBuilding = IBuilding> extends IGameDataStorage<TBuilding> {
    get byItemId(): IReadonlyDataMap<string, TBuilding>;
}