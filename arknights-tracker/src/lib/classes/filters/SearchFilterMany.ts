import { ASearchFilter } from "$lib/classes/filters/ASearchFilter";
import type { SearchFilterOptions } from "$lib/classes/filters/SearchFilterOptions";

export class SearchFilterMany<TEntity> extends ASearchFilter<TEntity> {
    private readonly _getStringsFn: (entity: TEntity) => readonly string[];

    public constructor(getStringsFn: (entity: TEntity) => readonly string[], options?: SearchFilterOptions) {
        super(options);

        this._getStringsFn = getStringsFn;
    }

    public satisfies(entity: TEntity): boolean {
        const search = this.searchString;

        if (!search) {
            return true;
        }

        const strings = this._getStringsFn(entity);

        return strings.some(str => this.normalize(str).includes(this.searchString));
    }
}