import { GameEvent } from "$lib/classes/events/legacy/GameEvent.js";
import { factoryEvents } from "$lib/data/events/factoryEvents.ts";

export class FactoryEvent extends GameEvent {
    _factoryEventObj;

    constructor(eventObj, factoryEventObj) {
        super(eventObj);

        this._factoryEventObj = factoryEventObj;
    }

    get eventItemIds() {
        return this._factoryEventObj.eventItemIds;
    }

    containsEventItemId(itemId) {
        return this.eventItemIds.includes(itemId);
    }

    static getFactoryEvent(eventId) {
        let gameEvent = GameEvent.getEvent(eventId);

        if (!gameEvent) return null;

        return FactoryEvent.getFactoryEventFromGameEvent(gameEvent);
    }

    static getFactoryEventFromGameEvent(gameEvent) {
        let factoryEvent = factoryEvents[gameEvent.id];

        if (!factoryEvent) return null;

        return new FactoryEvent(gameEvent, factoryEvent);
    }
}