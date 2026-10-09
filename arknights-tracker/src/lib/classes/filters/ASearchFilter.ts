import type { ISearchFilter } from "$lib/classes/filters/ISearchFilter";
import type { SearchFilterOptions } from "$lib/classes/filters/SearchFilterOptions";
import type { Subscriber, Unsubscriber } from "svelte/store";

export abstract class ASearchFilter<TEntity> implements ISearchFilter<TEntity> {
    private readonly _subscribers: Set<Subscriber<this>> = new Set();
    private readonly _options: Required<SearchFilterOptions>;

    private _searchString: string = "";

    protected constructor(options?: SearchFilterOptions) {
        this._options = ASearchFilter.getOptions(options);
    }

    private static getOptions(options: SearchFilterOptions | undefined): Required<SearchFilterOptions> {
        return {
            normalize: options?.normalize ?? true,
            normalizeForm: options?.normalizeForm ?? "NFD",
            ignoreCase: options?.normalize ?? true,
        };
    }

    public get searchString(): string {
        return this._searchString;
    }

    public set searchString(value: string) {
        const normalized = this.normalize(value);

        if (this._searchString === normalized) {
            return;
        }

        this._searchString = normalized;
        this.notify();
    }

    public subscribe(run: Subscriber<this>): Unsubscriber {
        run(this);

        this._subscribers.add(run);

        return () => {
            this._subscribers.delete(run);
        };
    }

    public abstract satisfies(entity: TEntity): boolean;

    public notify() {
        for (const run of [...this._subscribers]) {
            run(this);
        }
    }

   protected normalize(str: string): string {
        if (this._options.ignoreCase) {
            str = str.toLowerCase();
        }

        if (this._options.normalize) {
            str = str.normalize(this._options.normalizeForm)
                .replace(/\p{Diacritic}/gu, "")
                .replace(/\s/g, " ");
        }

        return str;
   }
}