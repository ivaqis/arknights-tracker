import type { IFilterChain } from "$lib/classes/filters/IFilterChain";
import type { IReactiveFilter } from "$lib/classes/filters/IReactiveFilter";

export interface IReactiveFilterChain<TEntity, TFilter extends IReactiveFilter<TEntity> = IReactiveFilter<TEntity>>
    extends IFilterChain<TEntity, TFilter>, IReactiveFilter<TEntity> {

    get manualMode(): boolean;

    destroy(): void;
    beginManual(): this;
    endManual(): this;
}