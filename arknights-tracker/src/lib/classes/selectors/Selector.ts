import { BaseSelector } from "$lib/classes/selectors/BaseSelector";
import type { ISelector } from "$lib/classes/selectors/ISelector";

export class Selector<TParam extends string | number = string>
    extends BaseSelector<TParam>
    implements ISelector<TParam> {

    protected constructor(paramList: readonly TParam[], limit: number = 0) {
        super(paramList, limit);
    }

    public set paramList(value: readonly TParam[]) {
        this.batch(() => {
            this.applyParamList(value);
        });
    }
}