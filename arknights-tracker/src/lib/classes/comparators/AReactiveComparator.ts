import type { IReactiveComparator } from "$lib/classes/comparators/IReactiveComparator";
import type { Subscriber, Unsubscriber } from "svelte/store";

export abstract class AReactiveComparator<T> implements IReactiveComparator<T> {
    protected readonly _subscribers: Set<Subscriber<this>> = new Set();

    protected constructor() {}

    public subscribe(run: Subscriber<this>): Unsubscriber {
        run(this);

        this._subscribers.add(run);

        return () => {
            this._subscribers.delete(run);
        }
    }

    public notify(): void {
        for (const run of [...this._subscribers]) {
            run(this);
        }
    }

    public abstract compare(a: T, b: T): number;
}