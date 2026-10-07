import type { IReactiveComparator } from "$lib/classes/comparators/IReactiveComparator";
import type { LocaleOrder } from "$lib/classes/comparators/LocaleOrder";

export interface ILocaleComparator<T> extends IReactiveComparator<T> {
    get isReversed(): boolean;
    set isReversed(value: boolean);
    get order(): LocaleOrder;
    set order(value: LocaleOrder);
}