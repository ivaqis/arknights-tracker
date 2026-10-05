import type { ISearchFilter } from "$lib/classes/filters/ISearchFilter";

export abstract class ASearchFilter<TEntity> implements ISearchFilter<TEntity> {
    private _searchString: string = "";

    protected constructor() {}

    public get searchString(): string {
        return this._searchString;
    }

    public set searchString(value: string) {
        this._searchString = value;
    }

    public abstract satisfies(entity: TEntity): boolean;
}