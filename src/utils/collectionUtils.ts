export function getMap<K, V>(list: V[], getKeyFn: (item: V) => K): Map<K, V> {
    const map: Map<K, V> = new Map();

    for (const item of list) {
        map.set(getKeyFn(item), item);
    }

    return map;
}