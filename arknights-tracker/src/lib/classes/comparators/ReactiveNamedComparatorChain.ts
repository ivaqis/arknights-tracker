import type { IReactiveComparator } from "$lib/classes/comparators/IReactiveComparator";
import type { IReactiveNamedComparatorChain } from "$lib/classes/comparators/IReactiveNamedComparatorChain";
import { ReactiveComparatorChain } from "$lib/classes/comparators/ReactiveComparatorChain";

export class ReactiveNamedComparatorChain<T, TName extends string = string, TComparator extends IReactiveComparator<T> = IReactiveComparator<T>>
    extends ReactiveComparatorChain<T, TComparator>
    implements IReactiveNamedComparatorChain<T, TName, TComparator> {

    private readonly _getComparatorFn: (name: TName) => TComparator;

    public constructor(getComparatorFn: (name: TName) => TComparator) {
        super();
        this._getComparatorFn = getComparatorFn;
    }

    public setOrderAliased(order: TName[]): void {
        const comparators = order.map(name => this._getComparatorFn(name));

        this.setOrder(comparators);
    }
}