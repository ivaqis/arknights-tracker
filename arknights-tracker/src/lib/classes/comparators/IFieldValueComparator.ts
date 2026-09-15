import type { IComparator } from "$lib/classes/comparators/IComparator";

export interface IFieldValueComparator<T, TValue = string> extends IComparator<T> {
    setValueOrder(orderList: TValue[]): void;
}