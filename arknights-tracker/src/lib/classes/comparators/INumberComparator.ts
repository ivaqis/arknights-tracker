import type { IReactiveComparator } from "$lib/classes/comparators/IReactiveComparator";
import type { SortDirection } from "$lib/classes/SortDirection";

export interface INumberComparator<T> extends IReactiveComparator<T> {
    get direction(): SortDirection;
    set direction(order: SortDirection);
}