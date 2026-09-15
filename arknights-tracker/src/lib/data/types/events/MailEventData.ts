import type { GameEventType } from "$lib/classes/events/GameEventType";
import type { EventData } from "$lib/data/types/events/EventData";

export interface MailEventData extends EventData<GameEventType.MAIL> {}