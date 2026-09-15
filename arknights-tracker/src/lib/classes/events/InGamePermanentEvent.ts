import { GameEvent } from "$lib/classes/events/GameEvent";
import { GameEventType } from "$lib/classes/events/GameEventType";
import type { IInGamePermanentEvent } from "$lib/classes/events/IInGamePermanentEvent";
import type { InGamePermanentEventData } from "$lib/data/types/events/InGamePermanentEventData";

export class InGamePermanentEvent extends GameEvent<GameEventType.IN_GAME_PERMANENT> implements IInGamePermanentEvent {

    public constructor(eventData: InGamePermanentEventData) {
        super(eventData);
    }
}