import type { IReactiveFilter } from "$lib/classes/filters/IReactiveFilter";

export interface IBaseFilterSelector<TEntity, TParam extends string | number = string> extends IReactiveFilter<TEntity> {
    get paramList(): readonly TParam[];
    get limit(): number;
    set limit(value: number);
    get selectedCount(): number;
    get isEmpty(): boolean;

    select(...params: TParam[]): void;
    add(param: TParam): boolean;
    push(param: TParam): boolean;
    remove(param: TParam): boolean;
    toggleAll(): void;
    addAll(): void;
    clear(): void;
    isSelected(param: TParam): boolean;
    isValidParam(param: TParam): boolean;
}