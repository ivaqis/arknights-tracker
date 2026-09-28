import { BlackboardEntry } from "$lib/classes/blackboard/BlackboardEntry";
import type { ITextableBlackboardEntry } from "$lib/classes/blackboard/ITextableBlackboardEntry";
import type { BbValueFormat } from "$lib/data/types/BbValueFormat";

export class TextableBlackboardEntry extends BlackboardEntry implements ITextableBlackboardEntry {
    private readonly _i18nKey: string;
    private readonly _format: BbValueFormat | null;

    public constructor(key: string, value: number, i18nKey: string, format?: BbValueFormat | null) {
        super(key, value);
        
        this._i18nKey = i18nKey;
        this._format = format ?? null;
    }

    public get i18nKey(): string {
        return this._i18nKey;
    }

    public get displayable(): boolean {
        if (this._format === null || this._format.display === undefined) {
            return true;
        }

        return this._format.display;
    }

    public getFormattedValue(): string {
        if (!this._format) {
            return String(this.value);
        }

        const formatter = new Intl.NumberFormat("en-US", this._format.intl);

        const formatted = formatter.format(this.value);
        const prefix = this._format.prefix ?? "";
        const postfix = this._format.postfix ?? "";

        return `${prefix}${formatted}${postfix}`;
    }
}