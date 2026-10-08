import type { ILocaleComparator } from "$lib/classes/comparators/ILocaleComparator";
import { LocaleOrder } from "$lib/classes/comparators/LocaleOrder";
import type { Subscriber, Unsubscriber } from "svelte/store";

export class LocaleComparator<T> implements ILocaleComparator<T> {
    private readonly _subscribers: Set<Subscriber<this>> = new Set();
    private readonly _getStringFn: (value: T) => string;
    private readonly _options: Intl.CollatorOptions;

    private _collator: Intl.Collator;
    private _locale: string;
    private _isReversed: boolean = false;

    public constructor(getStringFn: (value: T) => string, locale: string = "en-US", options?: Intl.CollatorOptions) {
        this._getStringFn = getStringFn;
        this._locale = locale;
        this._options = options ?? {
            usage: "sort",
            numeric: true,
            sensitivity: "accent"
        };
        this._collator = this.createCollator(locale);
    }

    public get locale(): string {
        return this._locale;
    }

    public set locale(value: string) {
        if (this._locale === value) {
            return;
        }

        this._locale = value;
        this._collator = this.createCollator(value);

        this.notify();
    }

    public get isReversed(): boolean {
        return this._isReversed;
    }

    public set isReversed(value: boolean) {
        if (this._isReversed === value) {
            return;
        }

        this._isReversed = value;

        this.notify();
    }

    public get order(): LocaleOrder {
        return this._isReversed ? LocaleOrder.Z_A : LocaleOrder.A_Z;
    }

    public set order(value: LocaleOrder) {
        this.isReversed = value === LocaleOrder.Z_A;
    }

    public compare(a: T, b: T): number {
        const strA = this._getStringFn(a);
        const strB = this._getStringFn(b);

        const result = this._collator.compare(strA, strB);

        return this._isReversed ? -result : result;
    }

    public subscribe(run: Subscriber<this>): Unsubscriber {
        run(this);

        this._subscribers.add(run);

        return () => {
            this._subscribers.delete(run);
        }
    }

    public notify(): void {
        for (const run of [...this._subscribers]) {
            run(this);
        }
    }

    private createCollator(locale: string): Intl.Collator {
        return new Intl.Collator(locale, this._options);
    }
}