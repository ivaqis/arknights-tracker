import type { IFilterSelector } from "$lib/classes/filters/IFilterSelector";
import type { Subscriber } from "svelte/store";

export abstract class AFilterSelector<TEntity, TParam extends string | number> implements IFilterSelector<TEntity, TParam> {
    private readonly _selectedParamSet: Set<TParam> = new Set();
    private readonly _subscribers: Set<Subscriber<this>> = new Set();

    private _paramList: readonly TParam[];
    private _paramSet: Set<TParam>;

    protected constructor(paramList: readonly TParam[]) {
        this._paramList = paramList;
        this._paramSet = new Set(paramList);
    }

    public get paramList(): readonly TParam[] {
        return this._paramList;
    }

    public set paramList(value: readonly TParam[]) {
        this._paramList = value;
        this._paramSet = new Set(value);

        this.validateSelected();
    }

    public get selectedCount(): number {
        return this._selectedParamSet.size;
    }

    public get isEmpty(): boolean {
        return this.selectedCount === 0;
    }

    public add(param: TParam): this {
        if (!this.isValidParam(param)) {
            throw new Error(`Invalid param: ${param}`);
        }

        this._selectedParamSet.add(param);

        return this;
    }

    public remove(param: TParam): boolean {
        return this._selectedParamSet.delete(param);
    }

    public select(...params: TParam[]): void {
        for (const param of params) {
            if (this.isSelected(param)) {
                this.remove(param);
            } else {
                this.add(param);
            }
        }
    }

    public isSelected(param: TParam): boolean {
        return this._selectedParamSet.has(param);
    }

    public addAll(): void {
        for (const param of this._paramList) {
            this.add(param);
        }
    }

    public clear(): void {
        this._selectedParamSet.clear();
    }

    public toggleAll(): void {
        if (this.isEmpty) {
            this.addAll();
        } else {
            this.clear();
        }
    }

    public abstract satisfies(entity: TEntity): boolean;

    private isValidParam(param: TParam): boolean {
        return this._paramSet.has(param);
    }

    private validateSelected(): void {
        for (const param of this._selectedParamSet.values()) {
            if (!this.isValidParam(param)) {
                this.remove(param);
            }
        }
    }
}