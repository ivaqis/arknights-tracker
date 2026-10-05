import type { IFilter } from "$lib/classes/filters/IFilter";
import type { IFilterChain } from "$lib/classes/filters/IFilterChain";
import type { Readable } from "svelte/store";

export class FilterChain<TEntity> implements IFilterChain<TEntity> {
    private readonly _chain: IFilter<TEntity>[][] = [[]];

    private constructor() {}

    public static create<T>(start: IFilter<T>): FilterChain<T> {
        const chain = new FilterChain<T>();

        chain.and(start);
        let  a: Readable<T>

        return chain;
    }

    public and(filter: IFilter<TEntity>): this {
        this._chain.at(-1)!.push(filter);

        return this;
    }

    public or(filter: IFilter<TEntity>): this {
        this._chain.push([filter]);

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