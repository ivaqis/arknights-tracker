export abstract class RecordField<T> {
    private readonly _initValue: T;

    private _newValue: T;

    protected constructor(initValue: T) {
        this._initValue = initValue;
        this._newValue = initValue;
    }

    public get initValue(): T {
        return this._initValue;
    }

    public get value(): T {
        return this._newValue;
    }

    public set value(value: T) {
        this._newValue = value;
    }
}