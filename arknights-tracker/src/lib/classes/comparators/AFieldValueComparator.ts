import type { IFieldValueComparator } from "$lib/classes/comparators/IFieldValueComparator";
import type { Subscriber, Unsubscriber } from "svelte/store";

export abstract class AFieldValueComparator<T, TValue> implements IFieldValueComparator<T, TValue> {
    protected readonly _valueOrders: Map<TValue, number> = new Map();

    private readonly _subscribers: Set<Subscriber<this>> = new Set();

    protected constructor() {
    }

    public compare(a: T, b: T): number {
        const orderA = this.getObjectOrder(a);
        const orderB = this.getObjectOrder(b);

        const diff = orderA - orderB;

        return isNaN(diff) ? 0 : diff;
    }

    public setValueOrder(orderList: readonly TValue[]) {
        this._valueOrders.clear();

        orderList.forEach((value, index) => {
            this._valueOrders.set(value, index);
        });

        this.notify();
    }

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

    protected getValueOrder(value: TValue): number {
        if (value === undefined || value === null) {
            return +Infinity;
        }

        return this._valueOrders.get(value) ?? +Infinity;
    }

    protected abstract getObjectOrder(obj: T): number;
}