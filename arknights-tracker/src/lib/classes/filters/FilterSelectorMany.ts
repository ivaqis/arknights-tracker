import { AFilterSelector } from "$lib/classes/filters/AFilterSelector";

export class FilterSelectorMany<TEntity, TParam extends string | number = string>
    extends AFilterSelector<TEntity, TParam> {

    private readonly _getParamsFn: (entity: TEntity) => Iterable<TParam>;

    public constructor(paramList: TParam[], getParamsFn: (entity: TEntity) => Iterable<TParam>, limit: number = 0) {
        super(paramList, limit);

        this._getParamsFn = getParamsFn;
    }

    public satisfies(entity: TEntity): boolean {
        if (this.isEmpty) {
            return true;
        }

        const params = this._getParamsFn(entity);

        for (const param of params) {
            if (this.isSelected(param)) {
                return true;
            }
        }

        return false;
    }
}