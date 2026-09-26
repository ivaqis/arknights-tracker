import type { IFieldValueComparator } from "$lib/classes/comparators/IFieldValueComparator";

export abstract class AFieldValueComparator<T, TValue> implements IFieldValueComparator<T, TValue> {
    protected readonly _valueOrders: Map<TValue, number> = new Map();

    protected constructor() {
    }

    public compare(a: T, b: T): number {
        const orderA = this.getObjectOrder(a);
        const orderB = this.getObjectOrder(b);

        return orderA - orderB;
    }

    public setValueOrder(orderList: TValue[]) {
        this._valueOrders.clear();

        orderList.forEach((value, index) => {
            this._valueOrders.set(value, index);
        });
    }

    protected getValueOrder(value: TValue): number {
        if (value === undefined || value === null) {
            return +Infinity;
        }

        return this._valueOrders.get(value) ?? +Infinity;
    }

    protected abstract getObjectOrder(obj: T): number;
}