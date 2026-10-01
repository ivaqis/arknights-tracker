import { BlackboardEntry } from "$lib/classes/blackboard/BlackboardEntry";
import type { ITextableBlackboardEntry } from "$lib/classes/blackboard/ITextableBlackboardEntry";
import type { LocalizationFn } from "$lib/i18n";

export class TextableBlackboardEntry extends BlackboardEntry implements ITextableBlackboardEntry {
    private readonly _i18nKey: string;
    private readonly _formatKey: string | null;
    private readonly _displayable: boolean;

    public constructor(key: string, value: number, i18nKey: string, formatKey?: string | null, display: boolean = true) {
        super(key, value);
        
        this._i18nKey = i18nKey;
        this._formatKey = formatKey ?? null;
        this._displayable = display;
    }

    public get i18nKey(): string {
        return this._i18nKey;
    }

    public get displayable(): boolean {
        return this._displayable;
    }

    public getFormattedValue(localeFn: LocalizationFn): string {
        if (!this._formatKey) {
            return String(this.value);
        }

        return localeFn(this._formatKey, { [this.key]: this.value });
    }
}