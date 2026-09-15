import { DataMap } from "$lib/classes/collections/DataMap";
import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IData } from "$lib/classes/IData";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { ListStorage } from "$lib/classes/storages/ListStorage";

export class DataStorage<T extends IData> extends ListStorage<T> implements IDataStorage<T> {
    private readonly _byId: IReadonlyDataMap<string, T>;

    public constructor(list: readonly T[]) {
        super(list);

        this._byId = DataMap.create(list, item => item.id);
    }

    public get byId(): IReadonlyDataMap<string, T> {
        return this._byId;
    }
}