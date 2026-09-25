import { GameEvent } from "$lib/classes/events/GameEvent";
import { GameEventType } from "$lib/classes/events/GameEventType";
import type { IInGameEvent } from "$lib/classes/events/IInGameEvent";
import type { InGameEventData } from "$lib/data/types/events/InGameEventData";

export class InGameEvent extends GameEvent<GameEventType.IN_GAME> implements IInGameEvent {
    public constructor(data: InGameEventData) {
        super(data);
    }
}