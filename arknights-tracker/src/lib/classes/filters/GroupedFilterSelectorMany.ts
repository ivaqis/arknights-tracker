import type { IGroupedFilterSelector } from "$lib/classes/filters/IGroupedFilterSelector";
import { GroupedSelector } from "$lib/classes/selectors/GroupedSelector";

export class GroupedFilterSelectorMany<TEntity, TParam extends string | number = string>
    extends GroupedSelector<TParam>
    implements IGroupedFilterSelector<TEntity, TParam> {

    private readonly _getParamsFn: (entity: TEntity) => Iterable<TParam>;

    public constructor(groups: ReadonlyArray<TParam>[], getParamsFn: (entity: TEntity) => Iterable<TParam>, limit: number = 0) {
        super(groups, limit);

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