import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IMiner } from "$lib/classes/gameData/buildings/miners/IMiner";
import type { IBuildingStorage } from "$lib/classes/storages/buildings/IBuildingStorage";

export interface IMinerStorage extends IBuildingStorage<IMiner> {
    get byMineableId(): IReadonlyDataMap<string, IMiner[]>;
    get byConsumeItemId(): IReadonlyDataMap<string, IMiner[]>;
}