import { AFieldValueComparator } from "$lib/classes/comparators/AFieldValueComparator";

export class FieldManyValuesComparator<T, TValue = string> extends AFieldValueComparator<T, TValue> {
    private readonly _getValuesFn: (value: T) => readonly TValue[];

    public constructor(getValuesFn: (value: T) => readonly TValue[]) {
        super();

        this._getValuesFn = getValuesFn;
    }

    protected getObjectOrder(obj: T): number {
        const values = this._getValuesFn(obj);

        return values.reduce(
            (min, value) => Math.min(min, this.getValueOrder(value)),
            +Infinity
        );
    }
}