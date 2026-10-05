import { ASearchFilter } from "$lib/classes/filters/ASearchFilter";

export class SearchFilter<TEntity> extends ASearchFilter<TEntity> {
    private readonly _getStringFn: (entity: TEntity) => string;

    public constructor(getStringFn: (entity: TEntity) => string) {
        super();

        this._getStringFn = getStringFn;
    }

    public satisfies(entity: TEntity): boolean {
        if (!this.searchString) {
            return true;
        }

        const str = this._getStringFn(entity);

        return str.includes(this.searchString);
    }
}