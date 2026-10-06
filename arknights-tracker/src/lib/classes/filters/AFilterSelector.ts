import { ABaseFilterSelector } from "$lib/classes/filters/ABaseFilterSelector";
import type { IFilterSelector } from "$lib/classes/filters/IFilterSelector";

export abstract class AFilterSelector<TEntity, TParam extends string | number>
    extends ABaseFilterSelector<TEntity, TParam>
    implements IFilterSelector<TEntity, TParam> {

    protected constructor(paramList: readonly TParam[], limit: number = 0) {
        super(paramList, limit);
    }

    public set paramList(value: readonly TParam[]) {
        this.batch(() => {
            this.applyParamList(value);
        });
    }
}