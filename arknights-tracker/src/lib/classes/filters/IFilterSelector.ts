import type { IReactiveFilter } from "$lib/classes/filters/IReactiveFilter";

export interface IFilterSelector<TEntity, TParam extends string | number = string> extends IReactiveFilter<TEntity> {
    get paramList(): readonly TParam[];
    set paramList(value: readonly TParam[]);
    get selectedCount(): number;
    get isEmpty(): boolean;

    select(...params: TParam[]): void;
    add(param: TParam): boolean;
    remove(param: TParam): boolean;
    toggleAll(): void;
    addAll(): void;
    clear(): void;
    isSelected(param: TParam): boolean;
}