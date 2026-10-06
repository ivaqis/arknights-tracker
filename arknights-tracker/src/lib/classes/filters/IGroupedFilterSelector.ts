import type { IBaseFilterSelector } from "$lib/classes/filters/IBaseFilterSelector";

export interface IGroupedFilterSelector<TEntity, TParam extends string | number = string>
    extends IBaseFilterSelector<TEntity, TParam> {
    get groups(): readonly ReadonlyArray<TParam>[];
    set groups(value: readonly ReadonlyArray<TParam>[]);
}