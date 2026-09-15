import type { IFactoryEvent } from "$lib/classes/events/IFactoryEvent";
import { InGameEvent } from "$lib/classes/events/InGameEvent";
import type { FactoryEventData } from "$lib/data/types/events/FactoryEventData";
import type { InGameEventData } from "$lib/data/types/events/InGameEventData";

export class FactoryEvent extends InGameEvent implements IFactoryEvent {
    private readonly _factoryEventData: FactoryEventData;

    public constructor(data: InGameEventData, factoryEventData: FactoryEventData) {
        super(data);

        this._factoryEventData = factoryEventData;
    }

    public get eventItemIds(): readonly string[] {
        return this._factoryEventData.eventItemIds;
    }
}