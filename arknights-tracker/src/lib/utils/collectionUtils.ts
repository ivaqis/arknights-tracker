export function getMap<K, V>(list: readonly V[], getKeyFn: (item: V) => K): Map<K, V> {
    const map = new Map<K, V>();

    for (const item of list) {
        map.set(getKeyFn(item), item);
    }

    return map;
}

export function getMappedList<K, V>(list: readonly V[], getKeyFn: (item: V) => K): Map<K, V[]> {
    const map = new Map<K, V[]>();

    for (const item of list) {
        let itemList = map.get(getKeyFn(item));

        if (!itemList) {
            itemList = [];
            map.set(getKeyFn(item), itemList);
        }

        itemList.push(item);
    }

    return map;
}