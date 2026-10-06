import { AGroupedFilterSelector } from "$lib/classes/filters/AGroupedFilterSelector";

export class GroupedFilterSelector<TEntity, TParam extends string | number = string> extends AGroupedFilterSelector<TEntity, TParam> {

    private readonly _getParamFn: (entity: TEntity) => TParam;

    public constructor(groups: ReadonlyArray<TParam>[], getValueFn: (entity: TEntity) => TParam, limit: number = 0) {
        super(groups, limit);

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