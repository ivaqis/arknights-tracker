import type { IBlackboardEntry } from "$lib/classes/blackboard/IBlackboardEntry";
import type { ITextable } from "$lib/classes/ITextable";
import type { LocalizationFn } from "$lib/i18n";

export interface ITextableBlackboardEntry
    extends IBlackboardEntry, ITextable {

    get displayable(): boolean;
    getFormattedValue(localeFn: LocalizationFn): string;
}