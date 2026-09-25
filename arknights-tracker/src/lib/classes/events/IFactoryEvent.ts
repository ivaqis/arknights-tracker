import type { IInGameEvent } from "$lib/classes/events/IInGameEvent";

export interface IFactoryEvent extends IInGameEvent {
    get eventItemIds(): readonly string[];
}