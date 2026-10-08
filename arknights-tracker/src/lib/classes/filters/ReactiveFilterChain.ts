import { FilterChain } from "$lib/classes/filters/FilterChain";
import type { IReactiveFilter } from "$lib/classes/filters/IReactiveFilter";
import type { IReactiveFilterChain } from "$lib/classes/filters/IReactiveFilterChain";
import type { Subscriber, Unsubscriber } from "svelte/store";

export class ReactiveFilterChain<TEntity, TFilter extends IReactiveFilter<TEntity> = IReactiveFilter<TEntity>>
    extends FilterChain<TEntity, TFilter>
    implements IReactiveFilterChain<TEntity, TFilter> {

    private readonly _subscribers: Set<Subscriber<this>> = new Set();
    private readonly _filterUnsubscribers: Map<TFilter, Unsubscriber> = new Map();

    private _manualMode: boolean = false;
    private _pendingNotify: boolean = false;

    public constructor() {
        super();
    }

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

    public subscribe(run: Subscriber<this>): Unsubscriber {
        run(this);

        this._subscribers.add(run);

        return () => {
            this._subscribers.delete(run);
        };
    }

    public destroy(): void {
        for (const unsub of this._filterUnsubscribers.values()) {
            unsub();
        }

        this._filterUnsubscribers.clear();
        this._subscribers.clear();
    }

    public and(filter: TFilter): this {
        super.and(filter);

        this.watch(filter);
        this.autoNotify();

        return this;
    }

    public or(filter: TFilter): this {
        super.or(filter);

        this.watch(filter);
        this.autoNotify();

        return this;
    }

    public notify(): void {
        this._pendingNotify = false;

        for (const run of [...this._subscribers]) {
            run(this);
        }
    }

    protected autoNotify() {
        if (this._manualMode) {
            this._pendingNotify = true;

            return;
        }

        this.notify();
    }

    private watch(filter: TFilter) {
        if (this._filterUnsubscribers.has(filter)) {
            return;
        }

        let ignoreFirstCall = true;

        const unsub = filter.subscribe(() => {
            if (ignoreFirstCall) {
                ignoreFirstCall = false;

                return;
            }

            this.autoNotify();
        });

        this._filterUnsubscribers.set(filter, unsub);
    }
}