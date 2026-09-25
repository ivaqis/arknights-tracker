import { GameEvent } from "$lib/classes/events/GameEvent";
import { GameEventType } from "$lib/classes/events/GameEventType";
import type { IMailEvent } from "$lib/classes/events/IMailEvent";
import type { MailEventData } from "$lib/data/types/events/MailEventData";

export class MailEvent extends GameEvent<GameEventType.MAIL> implements IMailEvent {

    public constructor(eventData: MailEventData) {
        super(eventData);
    }
}