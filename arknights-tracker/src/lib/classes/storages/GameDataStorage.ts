import { DataMap } from "$lib/classes/collections/DataMap";
import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IGameData } from "$lib/classes/gameData/IGameData";
import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";

export class GameDataStorage<T extends IGameData> extends DataStorage<T> implements IGameDataStorage<T> {
    private readonly _byGameId: IReadonlyDataMap<string, T>;

    public constructor(list: readonly T[]) {
        super(list);

        this._byGameId = DataMap.create(list, item => item.gameId);
    }

    public get byGameId(): IReadonlyDataMap<string, T> {
        return this._byGameId;
    }
}