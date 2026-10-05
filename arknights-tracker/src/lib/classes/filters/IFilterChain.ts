import type { IFilter } from "$lib/classes/filters/IFilter";

export interface IFilterChain<IEntity> extends IFilter<IEntity> {
    and(filter: IFilter<IEntity>): this;
    or(filter: IFilter<IEntity>): this;
}