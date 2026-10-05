import { AFilterSelector } from "$lib/classes/filters/AFilterSelector";

export class FilterSelector<TEntity, TParam extends string | number = string>
    extends AFilterSelector<TEntity, TParam> {

    private readonly _getParamFn: (entity: TEntity) => TParam;

    public constructor(paramList: TParam[], getValueFn: (entity: TEntity) => TParam, limit: number = 0) {
        super(paramList, limit);

        this._getParamFn = getValueFn;
    }

    public satisfies(entity: TEntity): boolean {
        if (this.isEmpty) {
            return true;
        }

        const param = this._getParamFn(entity);

        return this.isSelected(param);
    }
}