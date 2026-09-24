import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IVaporizer } from "$lib/classes/gameData/buildings/vaporizers/IVaporizer";
import type { IBuildingStorage } from "$lib/classes/storages/buildings/IBuildingStorage";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";

export interface IVaporizerStorage extends IBuildingStorage<IVaporizer> {
    get byConsumeItemId(): IReadonlyDataMap<string, IVaporizer[]>;
    get byGasEnvId(): IReadonlyDataMap<string, IVaporizer[]>;
}