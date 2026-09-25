export class ValidationRule<T> {
    private readonly _isValidFunc: (item: T) => boolean;
    private readonly _validMsg?: string;
    private readonly _invalidMsg?: string;

    constructor(isValidFunc: (item: T) => boolean, invalidMsg?: string, validMsg?: string) {
        this._isValidFunc = isValidFunc;
        this._validMsg = validMsg;
        this._invalidMsg = invalidMsg;
    }

    public isValid(item: T): boolean {
        return this._isValidFunc(item);
    }

    public get validMsg(): string | undefined {
        return this._validMsg;
    }

    public get invalidMsg(): string | undefined {
        return this._invalidMsg;
    }
}