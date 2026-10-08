import type { IComparatorChain } from "$lib/classes/comparators/IComparatorChain";
import type { IReactiveComparator } from "$lib/classes/comparators/IReactiveComparator";

export interface IReactiveComparatorChain<T, TComparator extends IReactiveComparator<T> = IReactiveComparator<T>>
    extends IComparatorChain<T, TComparator>, IReactiveComparator<T> {

    get manualMode(): boolean;

    destroy(): void;
    beginManual(): this;
    endManual(): this;
}