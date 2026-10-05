import type { IFilterSelector } from "$lib/classes/filters/IFilterSelector";
import type { Subscriber, Unsubscriber } from "svelte/store";

export abstract class AFilterSelector<TEntity, TParam extends string | number> implements IFilterSelector<TEntity, TParam> {
    private readonly _selectedParamSet: Set<TParam> = new Set();
    private readonly _subscribers: Set<Subscriber<this>> = new Set();

    private _paramList: readonly TParam[];
    private _paramSet: Set<TParam>;
    private _batchDepth: number = 0;
    private _batchChanged: boolean = false;

    protected constructor(paramList: readonly TParam[]) {
        this._paramList = paramList;
        this._paramSet = new Set(paramList);
    }

    public get paramList(): readonly TParam[] {
        return this._paramList;
    }

    public set paramList(value: readonly TParam[]) {
        this.batch(() => {
            this._paramList = value;
            this._paramSet = new Set(value);

            this.touch();
            this.validateSelected();
        });
    }

    public get selectedCount(): number {
        return this._selectedParamSet.size;
    }

    public get isEmpty(): boolean {
        return this.selectedCount === 0;
    }

    public add(param: TParam): boolean {
        if (!this.isValidParam(param)) {
            throw new Error(`Invalid param: ${param}`);
        }

        if (this._selectedParamSet.has(param)) {
            return false;
        }

        this._selectedParamSet.add(param);
        this.touch();

        return true;
    }

    public remove(param: TParam): boolean {
        const wasDeleted = this._selectedParamSet.delete(param);

        if (wasDeleted) {
            this.touch();
        }

        return wasDeleted;
    }

    public select(...params: TParam[]): void {
        this.batch(() => {
            for (const param of params) {
                if (this.isSelected(param)) {
                    this.remove(param);
                } else {
                    this.add(param);
                }
            }
        });
    }

    public isSelected(param: TParam): boolean {
        return this._selectedParamSet.has(param);
    }

    public addAll(): void {
        this.batch(() => {
            for (const param of this._paramList) {
                this.add(param);
            }
        });
    }

    public clear(): void {
        if (this._selectedParamSet.size === 0) {
            return;
        }

        this._selectedParamSet.clear();
        this.touch();
    }

    public toggleAll(): void {
        if (this.isEmpty) {
            this.addAll();
        } else {
            this.clear();
        }
    }

    public subscribe(run: Subscriber<this>): Unsubscriber {
        run(this);

        this._subscribers.add(run);

        return () => {
            this._subscribers.delete(run);
        };
    }

    public abstract satisfies(entity: TEntity): boolean;

    protected touch(): void {
        if (this._batchDepth > 0) {
            this._batchChanged = true;
        } else {
            this.notify();
        }
    }

    protected batch(action: () => void): void {
        this._batchDepth++;

        try {
            action();
        } finally {
            this._batchDepth--;

            if (this._batchDepth === 0 && this._batchChanged) {
                this._batchChanged = false;
                this.notify();
            }
        }
    }

    private isValidParam(param: TParam): boolean {
        return this._paramSet.has(param);
    }

    private validateSelected(): void {
        this.batch(() => {
            for (const param of this._selectedParamSet.values()) {
                if (!this.isValidParam(param)) {
                    this.remove(param);
                }
            }
        });
    }

    private notify() {
        for (const run of [...this._subscribers]) {
            run(this);
        }
    }
}