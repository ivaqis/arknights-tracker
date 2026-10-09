import type { NamedGroupEntry } from "$lib/classes/NamedGroupEntry";

export function getMap<K, V>(list: Iterable<V>, getKeyFn: (item: V) => K): Map<K, V> {
    const map = new Map<K, V>();

    for (const item of list) {
        map.set(getKeyFn(item), item);
    }

    return map;
}

export function getMapByList<K, V>(list: Iterable<V>, getKeysFn: (item: V) => Iterable<K>): Map<K, V> {
    const map = new Map<K, V>();

    for (const item of list) {
        const keys = getKeysFn(item);

        for (const key of keys) {
            map.set(key, item);
        }
    }

    return map;
}

export function getMappedList<K, V>(list: Iterable<V>, getKeyFn: (item: V) => K | readonly K[]): Map<K, V[]> {
    const map = new Map<K, V[]>();

    for (const item of list) {
        const keys = getKeyFn(item);

        if (Array.isArray(keys)) {
            for (const key of keys) {
                let itemList = map.get(key);

                if (!itemList) {
                    itemList = [];
                    map.set(key, itemList);
                }

                itemList.push(item);
            }
        } else {
            const key = keys as K;

            let itemList = map.get(key);

            if (!itemList) {
                itemList = [];
                map.set(key, itemList);
            }

            itemList.push(item);
        }
    }

    return map;
}

export function isListItemsEqual<T>(listA: readonly T[], listB: readonly T[]): boolean {
    if (!listA) {
        return false;
    }

    const set = new Set(listB);

    for (const item of listA) {
        const wasDeleted = set.delete(item);

        if (!wasDeleted) {
            return false;
        }
    }

    return set.size === 0;
}

export function groupPreservingOrder<T, K>(items: Iterable<T>, getKeyFn: (item: T) => K): [K, T[]][] {
    const order: K[] = [];
    const map: Map<K, T[]> = new Map();

    for (const item of items) {
        const key = getKeyFn(item);

        let itemList = map.get(key);

        if (!itemList) {
            itemList = [];
            map.set(key, itemList);
            order.push(key);
        }

        itemList.push(item);
    }

    return order.map(key => [key, map.get(key)!]);
}

export function groupCustomOrder<T, K>(items: Iterable<T>, getKeyFn: (item: T) => K, order: readonly K[]): [K, T[]][] {
    const map: Map<K, T[]> = new Map();

    for (const item of items) {
        const key = getKeyFn(item);

        let itemList = map.get(key);

        if (!itemList) {
            itemList = [];
            map.set(key, itemList);
        }

        itemList.push(item);
    }

    return order
        .filter(key => map.has(key))
        .map(key => [key, map.get(key)!]);
}

export function groupManyPreservingOrder<T, K>(items: Iterable<T>, getKeysFn: (item: T) => Iterable<K>): [K, T[]][] {
    const order: K[] = [];
    const map: Map<K, T[]> = new Map();

    for (const item of items) {
        const keys = getKeysFn(item);

        for (const key of keys) {

            let itemList = map.get(key);

            if (!itemList) {
                itemList = [];
                map.set(key, itemList);
                order.push(key);
            }

            itemList.push(item);
        }
    }

    return order.map(key => [key, map.get(key)!]);
}

export function groupManyCustomOrder<T, K>(items: Iterable<T>, getKeysFn: (item: T) => Iterable<K>, order: readonly K[]): [K, T[]][] {
    const map: Map<K, T[]> = new Map();

    for (const item of items) {
        const keys = getKeysFn(item);

        for (const key of keys) {

            let itemList = map.get(key);

            if (!itemList) {
                itemList = [];
                map.set(key, itemList);
            }

            itemList.push(item);
        }
    }

    return order
        .filter(key => map.has(key))
        .map(key => [key, map.get(key)!]);
}

export function groupPreservingOrderAndName<T, K>(items: Iterable<T>,
                                                  getKeyFn: (item: T) => K,
                                                  getNameFn: (key: K) => string
): NamedGroupEntry<T, K>[] {
    const groups = groupPreservingOrder(items, getKeyFn);

    return nameGroups(groups, getNameFn);
}

export function nameGroups<T, K>(groups: readonly [K, T[]][],
                                 getNameFn: (key: K) => string
): NamedGroupEntry<T, K>[] {
    return groups.map(([key, list]) => ({
        key,
        title: getNameFn(key),
        list
    }));
}