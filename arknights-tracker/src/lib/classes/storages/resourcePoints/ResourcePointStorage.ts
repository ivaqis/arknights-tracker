import { DataMap } from "$lib/classes/collections/DataMap";
import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";
import { ResourcePoint } from "$lib/classes/gameData/resourcePoints/ResourcePoint";
import { GameDataStorage } from "$lib/classes/storages/GameDataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { IResourcePointStorage } from "$lib/classes/storages/resourcePoints/IResourcePointStorage";
import type { ResourcePointData } from "$lib/data/types/items/ResourcePointData";

export class ResourcePointStorage extends GameDataStorage<IResourcePoint> implements IResourcePointStorage {
    private readonly _byItemId: IReadonlyDataMap<string, IResourcePoint>;

    public constructor(dataStorage: IDataStorage<ResourcePointData>, itemStorage: IItemStorage) {
        const list = ResourcePointStorage.getList(dataStorage, itemStorage);

        super(list);

        this._byItemId = DataMap.create(list, item => item.item.gameId);
    }

    private static getList(dataStorage: IDataStorage<ResourcePointData>, itemStorage: IItemStorage): IResourcePoint[] {
        const result: IResourcePoint[] = [];

        for (const data of dataStorage.list) {
            const item = itemStorage.byGameId.getOrThrow(data.itemId);

            result.push(ResourcePoint.createFromData(data, item));
        }

        return result;
    }

    public get byItemId(): IReadonlyDataMap<string, IResourcePoint> {
        return this._byItemId;
    }
}