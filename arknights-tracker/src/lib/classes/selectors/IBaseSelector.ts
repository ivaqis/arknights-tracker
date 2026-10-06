import type { Subscriber, Unsubscriber } from "svelte/store";

export interface IBaseSelector<TParam extends string | number = string> {
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
    subscribe(run: Subscriber<this>): Unsubscriber;
}