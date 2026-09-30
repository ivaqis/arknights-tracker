import type { IBlackboardEntry } from "$lib/classes/blackboard/IBlackboardEntry";

export class BlackboardEntry<T = number> implements IBlackboardEntry<T> {
    private readonly _key: string;
    private readonly _value: T;

    public constructor(key: string, value: T) {
        this._key = key;
        this._value = value;
    }

    public get key(): string {
        return this._key;
    }

    public get value(): T {
        return this._value;
    }
}