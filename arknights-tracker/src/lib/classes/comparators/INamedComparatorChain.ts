import type { IComparator } from "$lib/classes/comparators/IComparator";
import type { IComparatorChain } from "$lib/classes/comparators/IComparatorChain";

export interface INamedComparatorChain<T, TName extends string = string, TComparator extends IComparator<T> = IComparator<T>> extends IComparatorChain<T, TComparator> {
    setOrderAliased(order: readonly TName[]): void;
}