import { AReactiveComparator } from "$lib/classes/comparators/AReactiveComparator";
import type { INumberComparator } from "$lib/classes/comparators/INumberComparator";
import type { SortDirection } from "$lib/classes/SortDirection";

export class NumberComparator<T>
    extends AReactiveComparator<T>
    implements INumberComparator<T> {

    private readonly _getNumberFn: (value: T) => number;

    private _direction: SortDirection;

    public constructor(getNumberFn: (value: T) => number, direction: SortDirection = "asc") {
        super();

        this._getNumberFn = getNumberFn;
        this._direction = direction;
    }

    public get direction(): SortDirection {
        return this._direction;
    }

    public set direction(value: SortDirection) {
        if (this._direction === value) {
            return;
        }

        this._direction = value;

        this.notify();
    }

    public compare(a: T, b: T): number {
        const na = this._getNumberFn(a);
        const nb = this._getNumberFn(b);

        return this._direction === "asc" ? na - nb : nb - na;
    }
}