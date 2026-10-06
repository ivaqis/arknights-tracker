import { ABaseFilterSelector } from "$lib/classes/filters/ABaseFilterSelector";
import type { IGroupedFilterSelector } from "$lib/classes/filters/IGroupedFilterSelector";

export abstract class AGroupedFilterSelector<TEntity, TParam extends string | number>
    extends ABaseFilterSelector<TEntity, TParam>
    implements IGroupedFilterSelector<TEntity, TParam> {

    private _groups: readonly ReadonlyArray<TParam>[];

    protected constructor(groups: readonly ReadonlyArray<TParam>[], limit: number = 0) {
        const params = AGroupedFilterSelector.getParams(groups);

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
            const params = AGroupedFilterSelector.getParams(value);

            this._groups = value;
            this.applyParamList(params);
        });
    }
}