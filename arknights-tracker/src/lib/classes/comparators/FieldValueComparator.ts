import type { IFieldValueComparator } from "$lib/classes/comparators/IFieldValueComparator";

export class FieldValueComparator<T, TValue = string> implements IFieldValueComparator<T, TValue> {
    private readonly _getValueFn: (value: T) => TValue;
    private readonly _valueOrders: Map<TValue, number> = new Map();

    public constructor(getValueFn: (value: T) => TValue) {
        this._getValueFn = getValueFn;
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

    private getValueOrder(value: TValue): number {
        if (value === undefined || value === null) {
            return +Infinity;
        }

        return this._valueOrders.get(value) ?? +Infinity;
    }

    private getObjectOrder(obj: T): number {
        const value = this._getValueFn(obj);

        return this.getValueOrder(value);
    }
}