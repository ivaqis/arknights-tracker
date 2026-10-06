import { BaseSelector } from "$lib/classes/selectors/BaseSelector";
import type { IGroupedSelector } from "$lib/classes/selectors/IGroupedSelector";

export class GroupedSelector<TParam extends string | number = string>
    extends BaseSelector<TParam>
    implements IGroupedSelector<TParam> {

    private _groups: readonly ReadonlyArray<TParam>[];

    protected constructor(groups: readonly ReadonlyArray<TParam>[], limit: number = 0) {
        const params = GroupedSelector.getParams(groups);

        super(params, limit);

        this._groups = groups;
    }

    private static getParams<TParam>(groups: readonly ReadonlyArray<TParam>[]): TParam[] {
        const list: TParam[] = [];

        for (const group of groups) {
            list.push(...group);
        }

        return list;
    }

    public get groups(): readonly ReadonlyArray<TParam>[] {
        return this._groups;
    }

    public set groups(value: readonly ReadonlyArray<TParam>[]) {
        this.batch(() => {
            const params = GroupedSelector.getParams(value);

            this._groups = value;
            this.applyParamList(params);
        });
    }
}