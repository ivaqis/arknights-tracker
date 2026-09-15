import type { GameEventType } from "$lib/classes/events/GameEventType";
import type { EventData } from "$lib/data/types/events/EventData";

export interface SignInEventData extends EventData<GameEventType.SIGN_IN> {}