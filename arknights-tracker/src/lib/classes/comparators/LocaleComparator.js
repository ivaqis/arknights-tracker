import { IComparator } from "$lib/classes/comparators/IComparator.js";

export class LocaleComparator extends IComparator {
    _getLocaleFunc;
    _reversed = false;

    constructor(getLocaleFunc) {
        super();

        this._getLocaleFunc = getLocaleFunc;
    }

    get isReversed() {
        return this._reversed;
    }

    set isReversed(value) {
        this._reversed = value;
    }

    set getLocaleFunc(getLocaleFunc) {
        this._getLocaleFunc = getLocaleFunc;
    }

    compare(objA, objB) {
        let localeA = this._getLocale(objA);
        let localeB = this._getLocale(objB);

        if (localeA === null || localeB === null) {
            return 0;
        }

        let result = localeA.localeCompare(localeB);

        return this.isReversed ? -result : result;
    }

    _getLocale(obj) {
        return this._getLocaleFunc?.(obj) ?? null;
    }
}