import type { IFilter } from "$lib/classes/filters/IFilter";
import type { IFilterChain } from "$lib/classes/filters/IFilterChain";

export class FilterChain<TEntity, TFilter extends IFilter<TEntity> = IFilter<TEntity>> implements IFilterChain<TEntity, TFilter> {
    private readonly _chain: TFilter[][] = [[]];

    public constructor() {}

    public and(filter: TFilter): this {
        this._chain.at(-1)!.push(filter);

        return this;
    }

    public or(filter: TFilter): this {
        const last = this._chain.at(-1)!;

        if (last.length === 0) {
            last.push(filter);
        } else {
            this._chain.push([filter]);
        }

        return this;
    }

    public satisfies(entity: TEntity): boolean {
        for (const andFilterChain of this._chain) {
            let satisfies = true;

            for (const filter of andFilterChain) {
                if (!filter.satisfies(entity)) {
                    satisfies = false;

                    break;
                }
            }

            if (satisfies) {
                return true;
            }
        }

        return false;
    }
}