import type { ITextableBlackboardEntry } from "$lib/classes/blackboard/ITextableBlackboardEntry";
import type { ITextable } from "$lib/classes/ITextable";

export interface IFoodBuff extends ITextable {
    get buffId(): string;
    get blackboard(): readonly ITextableBlackboardEntry[];

    getBBEntry(key: string): ITextableBlackboardEntry | null;
    hasBBEntry(key: string): boolean;
}