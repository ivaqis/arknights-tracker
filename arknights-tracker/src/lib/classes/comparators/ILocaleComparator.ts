import type { IComparator } from "$lib/classes/comparators/IComparator";

export interface ILocaleComparator<T> extends IComparator<T> {
    get isReversed(): boolean;
    set isReversed(value: boolean);
}