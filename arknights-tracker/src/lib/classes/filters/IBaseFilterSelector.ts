import type { IReactiveFilter } from "$lib/classes/filters/IReactiveFilter";
import type { IBaseSelector } from "$lib/classes/selectors/IBaseSelector";

export interface IBaseFilterSelector<TEntity, TParam extends string | number = string>
    extends IReactiveFilter<TEntity>, IBaseSelector<TParam> {}