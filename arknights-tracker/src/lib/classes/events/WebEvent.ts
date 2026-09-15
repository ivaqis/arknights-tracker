import { GameEvent } from "$lib/classes/events/GameEvent";
import type { GameEventType } from "$lib/classes/events/GameEventType";
import type { IWebEvent } from "$lib/classes/events/IWebEvent";
import type { WebEventData } from "$lib/data/types/events/WebEventData";

export class WebEvent extends GameEvent<GameEventType.WEB> implements IWebEvent {
    private readonly _webEventData: WebEventData;

    public constructor(eventData: WebEventData) {
        super(eventData);

        this._webEventData = eventData;
    }

    public get webUrl(): string | null {
        return this._webEventData.webUrl ?? null;
    }
}