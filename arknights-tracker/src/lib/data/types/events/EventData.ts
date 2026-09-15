import type { GameEventType } from "$lib/classes/events/GameEventType";
import type { IData } from "$lib/classes/IData";

export interface EventData<T extends GameEventType> extends IData {
    readonly title: string;
    readonly name?: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly startTimeAsia?: string;
    readonly endTimeAsia?: string;
    readonly icon: string;
    readonly url?: string;
    readonly officialUrl?: string;
    readonly color: string;
    readonly layer: number;
    readonly type: `${T}`;
    readonly iconPosition: number;
    readonly version: string;
    readonly isPermanent?: boolean;
}