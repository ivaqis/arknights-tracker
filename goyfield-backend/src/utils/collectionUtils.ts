export function getMap<K, V>(list: V[], getKeyFn: (item: V) => K): Map<K, V> {
    const map: Map<K, V> = new Map();

    for (const item of list) {
        map.set(getKeyFn(item), item);
    }

    return map;
}

export function getMapList<K, V>(list: V[], getKeyFn: (item: V) => K): Map<K, V[]> {
    const map = new Map<K, V[]>();

    for (const item of list) {
        let list = map.get(getKeyFn(item));

        if (!list) {
            list = [];
            map.set(getKeyFn(item), list);
        }

        list.push(item);
    }

    return map;
}