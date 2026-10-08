import type { IBaseSelector } from "$lib/classes/selectors/IBaseSelector";

export interface IGroupedSelector<TParam extends string | number = string> extends IBaseSelector<TParam> {
    get groups(): readonly ReadonlyArray<TParam>[];
    set groups(value: readonly ReadonlyArray<TParam>[]);
}