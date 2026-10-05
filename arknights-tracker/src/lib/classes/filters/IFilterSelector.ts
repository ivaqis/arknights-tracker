import type { IFilter } from "$lib/classes/filters/IFilter";
import type { IReactiveFilter } from "$lib/classes/filters/IReactiveFilter";

export interface IFilterSelector<TEntity, TParam extends string | number = string> extends IFilter<TEntity> {
    get paramList(): readonly TParam[];
    set paramList(value: readonly TParam[]);
    get selectedCount(): number;
    get isEmpty(): boolean;

    select(...params: TParam[]): void;
    add(param: TParam): this;
    remove(param: TParam): boolean;
    toggleAll(): void;
    addAll(): void;
    clear(): void;
    isSelected(param: TParam): boolean;
}