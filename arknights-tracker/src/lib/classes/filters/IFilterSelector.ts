import type { IBaseFilterSelector } from "$lib/classes/filters/IBaseFilterSelector";
import type { ISelector } from "$lib/classes/selectors/ISelector";

export interface IFilterSelector<TEntity, TParam extends string | number = string>
    extends IBaseFilterSelector<TEntity, TParam>, ISelector<TParam> {
    set paramList(value: readonly TParam[]);
}