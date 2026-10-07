import { ComparatorChain } from "$lib/classes/comparators/ComparatorChain";
import type { IComparator } from "$lib/classes/comparators/IComparator";
import type { INamedComparatorChain } from "$lib/classes/comparators/INamedComparatorChain";

export class NamedComparatorChain<T, TName extends string = string, TComparator extends IComparator<T> = IComparator<T>>
    extends ComparatorChain<T, TComparator>
    implements INamedComparatorChain<T, TName, TComparator> {

    private readonly _getComparatorFn: (name: TName) => TComparator;

    public constructor(getComparatorFn: (name: TName) => TComparator) {
        super();
        this._getComparatorFn = getComparatorFn;
    }

    public setOrderAliased(order: TName[]): void {
        const comparators = order.map(name => this._getComparatorFn(name));

        super.setOrder(comparators);
    }
}