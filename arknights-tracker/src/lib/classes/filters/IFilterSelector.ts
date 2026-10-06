import type { IBaseFilterSelector } from "$lib/classes/filters/IBaseFilterSelector";

export interface IFilterSelector<TEntity, TParam extends string | number = string>
    extends IBaseFilterSelector<TEntity, TParam> {
    set paramList(value: readonly TParam[]);
}