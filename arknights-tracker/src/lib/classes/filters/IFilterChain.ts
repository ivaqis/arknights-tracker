import type { IFilter } from "$lib/classes/filters/IFilter";

export interface IFilterChain<TEntity, TFilter extends IFilter<TEntity> = IFilter<TEntity>> extends IFilter<TEntity> {
    and(filter: TFilter): this;
    or(filter: TFilter): this;
}