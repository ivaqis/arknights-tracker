import type { IReactiveComparator } from "$lib/classes/comparators/IReactiveComparator";

export interface IFieldValueComparator<T, TValue = string> extends IReactiveComparator<T> {
    setValueOrder(orderList: TValue[]): void;
}