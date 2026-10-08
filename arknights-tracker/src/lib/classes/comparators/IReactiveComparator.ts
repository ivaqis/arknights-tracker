import type { IComparator } from "$lib/classes/comparators/IComparator";
import type { Subscriber, Unsubscriber } from "svelte/store";

export interface IReactiveComparator<T> extends IComparator<T> {
    subscribe(run: Subscriber<this>): Unsubscriber;
    notify(): void;
}