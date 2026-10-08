import type { IBaseSelector } from "$lib/classes/selectors/IBaseSelector";

export interface ISelector<TParam extends string | number = string> extends IBaseSelector<TParam> {
    set paramList(value: readonly TParam[]);
}