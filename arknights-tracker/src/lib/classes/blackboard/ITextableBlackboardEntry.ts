import type { IBlackboardEntry } from "$lib/classes/blackboard/IBlackboardEntry";
import type { ITextable } from "$lib/classes/ITextable";

export interface ITextableBlackboardEntry
    extends IBlackboardEntry, ITextable {

    get displayable(): boolean;
    getFormattedValue(): string;
}