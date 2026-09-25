import type { ILocaleComparator } from "$lib/classes/comparators/ILocaleComparator";

export class LocaleComparator<T> implements ILocaleComparator<T> {
    private readonly _getStringFn: (value: T) => string;

    private _isReversed: boolean = false;

    public constructor(getStringFn: (value: T) => string) {
        this._getStringFn = getStringFn;
    }

    public get isReversed(): boolean {
        return this._isReversed;
    }

    public set isReversed(value: boolean) {
        this._isReversed = value;
    }

    public compare(a: T, b: T): number {
        const strA = this._getStringFn(a);
        const strB = this._getStringFn(b);

        const result = strA.localeCompare(strB);

        return this._isReversed ? -result : result;
    }
}