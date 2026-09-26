import { AFieldValueComparator } from "$lib/classes/comparators/AFieldValueComparator";
import type { IFieldValueComparator } from "$lib/classes/comparators/IFieldValueComparator";

export class FieldValueComparator<T, TValue = string>
    extends AFieldValueComparator<T, TValue>
    implements IFieldValueComparator<T, TValue> {

    private readonly _getValueFn: (value: T) => TValue;

    public constructor(getValueFn: (value: T) => TValue) {
        super();

        this._getValueFn = getValueFn;
    }

    protected getObjectOrder(obj: T): number {
        const value = this._getValueFn(obj);

        return this.getValueOrder(value);
    }
}