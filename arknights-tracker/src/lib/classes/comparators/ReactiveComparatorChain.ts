import { ComparatorChain } from "$lib/classes/comparators/ComparatorChain";
import type { IReactiveComparator } from "$lib/classes/comparators/IReactiveComparator";
import type { IReactiveComparatorChain } from "$lib/classes/comparators/IReactiveComparatorChain";
import type { Subscriber, Unsubscriber } from "svelte/store";

export class ReactiveComparatorChain<T, TComparator extends IReactiveComparator<T> = IReactiveComparator<T>>
    extends ComparatorChain<T, TComparator>
    implements IReactiveComparatorChain<T, TComparator> {

    private readonly _subscribers: Set<Subscriber<this>> = new Set();
    private readonly _subscriptions: Map<TComparator, Unsubscriber> = new Map();
    private _pendingNotify: boolean = false;

    public constructor() {
        super();
    }

    private _manualMode: boolean = false;

    public get manualMode(): boolean {
        return this._manualMode;
    }

    public beginManual(): this {
        this._manualMode = true;

        return this;
    }

    public endManual(): this {
        this._manualMode = false;

        if (this._pendingNotify) {
            this.notify();
        }

        return this;
    }

    public notify(): void {
        this._pendingNotify = false;

        for (const run of [...this._subscribers]) {
            run(this);
        }
    }

    public subscribe(run: Subscriber<this>): Unsubscriber {
        run(this);

        this._subscribers.add(run);

        return () => {
            this._subscribers.delete(run);
        };
    }

    public destroy(): void {
        for (const unsub of this._subscriptions.values()) {
            unsub();
        }

        this._subscriptions.clear();
        this._subscribers.clear();
    }

    public setOrder(order: TComparator[]) {
        const changed = this.isOrderChanged(order);

        if (!changed) {
            return;
        }

        super.setOrder(order);

        const set = new Set(order);

        for (const [comparator, unsub] of this._subscriptions.entries()) {
            if (set.has(comparator)) {
                set.delete(comparator);

                continue;
            }

            unsub();
            this._subscriptions.delete(comparator);
        }

        for (const comparator of set.values()) {
            this.watch(comparator);
        }

        this.autoNotify();
    }

    protected autoNotify(): void {
        if (this._manualMode) {
            this._pendingNotify = true;

            return;
        }

        this.notify();
    }

    private watch(comparator: TComparator) {
        if (this._subscriptions.has(comparator)) {
            return;
        }

        let ignoreFirstCall = true;

        const unsub = comparator.subscribe(() => {
            if (ignoreFirstCall) {
                ignoreFirstCall = false;

                return;
            }

            this.autoNotify();
        });

        this._subscriptions.set(comparator, unsub);
    }

    private isOrderChanged(next: readonly TComparator[]): boolean {
        if (this.order.length !== next.length) {
            return true;
        }

        for (let i = 0; i < this.order.length; i++) {
            if (this.order[i] !== next[i]) {
                return true;
            }
        }

        return false;
    }
}