import type { IFilter } from "$lib/classes/filters/IFilter";
import type { IReactiveFilter } from "$lib/classes/filters/IReactiveFilter";

export interface ISearchFilter<TEntity> extends IFilter<TEntity> {
    get searchString(): string;
    set searchString(value: string);
}