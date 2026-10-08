import type { IReactiveFilter } from "$lib/classes/filters/IReactiveFilter";

export interface ISearchFilter<TEntity> extends IReactiveFilter<TEntity> {
    get searchString(): string;
    set searchString(value: string);
}