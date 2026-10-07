import type { IComparator } from "$lib/classes/comparators/IComparator";
import type { IComparatorChain } from "$lib/classes/comparators/IComparatorChain";

export class ComparatorChain<T, TComparator extends IComparator<T> = IComparator<T>> implements IComparatorChain<T, TComparator> {
    private _order: readonly TComparator[] = [];

    public constructor() {
    }

    public get order(): readonly TComparator[] {
        return this._order;
    }

    public setOrder(order: readonly TComparator[]): void {
        this._order = order;
    }

    public compare(a: T, b: T): number {
        for (const comparator of this._order) {
            const diff = comparator.compare(a, b);

            if (diff !== 0) {
                return diff;
            }
        }

        return 0;
    }
}