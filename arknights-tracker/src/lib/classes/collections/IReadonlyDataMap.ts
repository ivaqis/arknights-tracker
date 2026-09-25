export interface IReadonlyDataMap<K, V> {
    get(key: K): V | undefined;
    getOrThrow(key: K): V;
    has(key: K): boolean;
}