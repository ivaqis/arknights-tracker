import { ASearchFilter } from "$lib/classes/filters/ASearchFilter";

export class SearchFilterMany<TEntity> extends ASearchFilter<TEntity> {
    private readonly _getStringsFn: (entity: TEntity) => readonly string[];

    public constructor(getStringsFn: (entity: TEntity) => readonly string[]) {
        super();

        this._getStringsFn = getStringsFn;
    }

    public satisfies(entity: TEntity): boolean {
        const search = this.searchString;

        if (!search) {
            return true;
        }

        const strings = this._getStringsFn(entity);

        return strings.some(str => str.includes(search));
    }
}