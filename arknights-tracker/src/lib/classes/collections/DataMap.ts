import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import { getMap, getMappedList } from "$lib/utils/collectionUtils";

export class DataMap<K, V> implements IReadonlyDataMap<K, V> {
    private readonly _map: Map<K, V>;

    public constructor(map: Map<K, V>) {
        this._map = map;
    }

    public static create<K, V>(list: readonly V[], getIdFn: (item: V) => K): DataMap<K, V> {
        return new DataMap(getMap(list, getIdFn));
    }

    public static createListed<K, V>(list: readonly V[], getIdFn: (item: V) => K | readonly K[]): DataMap<K, V[]> {
        return new DataMap(getMappedList(list, getIdFn));
    }

    public getOrThrow(key: K): V {
        const value = this.get(key);

        if (!value) {
            throw new Error(`Key ${key} not found`);
        }

        return value;
    }

    public get(key: K): V | undefined {
        return this._map.get(key);
    }

    public has(key: K): boolean {
        return this._map.has(key);
    }
}