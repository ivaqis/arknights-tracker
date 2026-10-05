import type { IFilterSelector } from "$lib/classes/filters/IFilterSelector";
import type { Subscriber, Unsubscriber } from "svelte/store";

export abstract class AFilterSelector<TEntity, TParam extends string | number> implements IFilterSelector<TEntity, TParam> {
    private readonly _selectedParamSet: Set<TParam> = new Set();
    private readonly _subscribers: Set<Subscriber<this>> = new Set();

    private _paramList: readonly TParam[];
    private _paramSet: Set<TParam>;
    private _limit: number = 0;
    private _selectedParamQueue: TParam[] = [];

    private _batchDepth: number = 0;
    private _batchChanged: boolean = false;

    protected constructor(paramList: readonly TParam[], limit: number = 0) {
        this._paramList = paramList;
        this._paramSet = new Set(paramList);
        this.limit = limit;
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
        return this._selectedParamQueue.length;
    }

    public get isEmpty(): boolean {
        return this.selectedCount === 0;
    }

    public get limit(): number {
        return this._limit;
    }

    public set limit(value: number) {
        if (isNaN(value) || value < 1 || value === +Infinity) {
            value = 0;
        }

        value = Math.floor(value);

        const isChanged = this._limit !== value;

        if (!isChanged) {
            return;
        }

        this._limit = value;

        this.applyLimit();
        this.touch();
    }

    public add(param: TParam): boolean {
        if (!this.isValidParam(param)) {
            throw new Error(`Invalid param: ${param}`);
        }

        if (this.isSelected(param)) {
            return false;
        }

        this.batch(() => {
            this.addParam(param);

            this.touch();
        });

        return true;
    }

    public push(param: TParam): boolean {
        if (!this.isValidParam(param)) {
            throw new Error(`Invalid param: ${param}`);
        }

        if (this.isSelected(param)) {
            const index = this._selectedParamQueue.indexOf(param);

            this._selectedParamQueue.splice(index, 1);
            this._selectedParamQueue.push(param);

            return false;
        }

        this.batch(() => {
            this.addParam(param);

            this.touch();
        });

        return true;
    }

    public remove(param: TParam): boolean {
        if (!this.isSelected(param)) {
            return false;
        }

        const index = this._selectedParamQueue.indexOf(param);

        this._selectedParamQueue.splice(index, 1);
        this._selectedParamSet.delete(param);
        this.touch();

        return true;
    }

    public select(...params: TParam[]): void {
        this.batch(() => {
            for (const param of params) {
                if (this.isSelected(param)) {
                    this.remove(param);
                } else {
                    this.push(param);
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
        if (this._selectedParamQueue.length === 0) {
            return;
        }

        this._selectedParamQueue = [];
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
            let isChanged = false;

            for (let i = this._selectedParamQueue.length - 1; i >= 0; i--) {
                const param = this._selectedParamQueue[i];

                if (!this.isValidParam(param)) {
                    this._selectedParamQueue.splice(i, 1);
                    this._selectedParamSet.delete(param);

                    isChanged = true;
                }
            }

            if (isChanged) {
                this.touch();
            }
        });
    }

    private addParam(param: TParam) {
        this._selectedParamQueue.push(param);
        this._selectedParamSet.add(param);

        this.applyLimit();
    }

    private applyLimit() {
        if (this._limit < 1) {
            return;
        }

        let difference = this._selectedParamQueue.length - this._limit;

        if (difference <= 0) {
            return;
        }

        const deleted = this._selectedParamQueue.splice(0, difference);

        deleted.forEach(param => this._selectedParamSet.delete(param));
    }

    private notify() {
        for (const run of [...this._subscribers]) {
            run(this);
        }
    }
}