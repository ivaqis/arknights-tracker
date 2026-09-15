import type { GameEventType } from "$lib/classes/events/GameEventType";
import type { EventData } from "$lib/data/types/events/EventData";

export interface InGameEventData extends EventData<GameEventType.IN_GAME> {}