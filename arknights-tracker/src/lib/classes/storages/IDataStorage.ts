import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IData } from "$lib/classes/IData";
import type { IListStorage } from "$lib/classes/storages/IListStorage";

export interface IDataStorage<T extends IData> extends IListStorage<T> {
    get byId(): IReadonlyDataMap<string, T>;
}