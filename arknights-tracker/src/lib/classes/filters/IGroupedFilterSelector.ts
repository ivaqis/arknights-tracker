import type { IBaseFilterSelector } from "$lib/classes/filters/IBaseFilterSelector";
import type { IGroupedSelector } from "$lib/classes/selectors/IGroupedSelector";

export interface IGroupedFilterSelector<TEntity, TParam extends string | number = string>
    extends IBaseFilterSelector<TEntity, TParam>, IGroupedSelector<TParam> {}