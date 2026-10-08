import { ASearchFilter } from "$lib/classes/filters/ASearchFilter";
import type { SearchFilterOptions } from "$lib/classes/filters/SearchFilterOptions";

export class SearchFilter<TEntity> extends ASearchFilter<TEntity> {
    private readonly _getStringFn: (entity: TEntity) => string;

    public constructor(getStringFn: (entity: TEntity) => string, options?: SearchFilterOptions) {
        super(options);

        this._getStringFn = getStringFn;
    }

    public satisfies(entity: TEntity): boolean {
        if (!this.searchString) {
            return true;
        }

        const str = this._getStringFn(entity);

        return this.normalize(str).includes(this.searchString);
    }
}