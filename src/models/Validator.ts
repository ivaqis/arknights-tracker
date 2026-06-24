export abstract class Validator<T> {
    protected readonly _messages: string[] = [];
    protected readonly _entity: T;

    private readonly _isValid: boolean;

    protected constructor(entity: T) {
        this._entity = entity;
        this._isValid = this.validate(entity);
    }

    public get messages(): string[] {
        return this._messages;
    }

    public get isValid(): boolean {
        return this._isValid;
    }

    protected abstract validate(entity: T): boolean;
}