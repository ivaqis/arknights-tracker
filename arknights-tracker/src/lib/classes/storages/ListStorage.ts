import type { IListStorage } from "$lib/classes/storages/IListStorage";

export class ListStorage<T> implements IListStorage<T> {
    private readonly _list: readonly T[];

    public constructor(list: readonly T[]) {
        this._list = list;
    }

    public get list(): readonly T[] {
        return this._list;
    }
}