import type { INamedComparatorChain } from "$lib/classes/comparators/INamedComparatorChain";
import type { IReactiveComparator } from "$lib/classes/comparators/IReactiveComparator";
import type { IReactiveComparatorChain } from "$lib/classes/comparators/IReactiveComparatorChain";

export interface IReactiveNamedComparatorChain<T, TName extends string = string, TComparator extends IReactiveComparator<T> = IReactiveComparator<T>>
    extends INamedComparatorChain<T, TName, TComparator>, IReactiveComparatorChain<T, TComparator> {}