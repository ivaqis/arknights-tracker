import type { GameEventType } from "$lib/classes/events/GameEventType";
import type { EventData } from "$lib/data/types/events/EventData";

export interface InGamePermanentEventData extends EventData<GameEventType.IN_GAME_PERMANENT> {
    readonly isPermanent?: boolean;
}