import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IFullGasJar } from "$lib/classes/gameData/items/fullJars/IFullGasJar";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";

export interface IFullGasJarStorage extends IGameDataStorage<IFullGasJar> {
    get byEmptyJarId(): IReadonlyDataMap<string, IFullGasJar[]>;
    get byGasId(): IReadonlyDataMap<string, IFullGasJar[]>;
}