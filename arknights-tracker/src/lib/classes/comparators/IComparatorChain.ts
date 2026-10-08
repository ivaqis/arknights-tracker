import type { IComparator } from "$lib/classes/comparators/IComparator";

export interface IComparatorChain<T, TComparator extends IComparator<T> = IComparator<T>> extends IComparator<T> {
    get order(): readonly TComparator[];

    setOrder(order: readonly TComparator[]): void;
}