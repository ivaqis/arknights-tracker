import type { IFilter } from "$lib/classes/filters/IFilter";
import type { Subscriber, Unsubscriber } from "svelte/store";

export interface IReactiveFilter<TEntity> extends IFilter<TEntity> {
    subscribe(run: Subscriber<this>): Unsubscriber;
    notify(): void;
}