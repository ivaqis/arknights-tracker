import type { GameEventType } from "$lib/classes/events/GameEventType";
import type { EventData } from "$lib/data/types/events/EventData";

export interface WebEventData extends EventData<GameEventType.WEB> {
    readonly webUrl?: string;
}