import { FactoryEvent } from "$lib/classes/events/FactoryEvent";
import type { IFactoryEvent } from "$lib/classes/events/IFactoryEvent";
import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IFactoryEventStorage } from "$lib/classes/storages/events/IFactoryEventStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { FactoryEventData } from "$lib/data/types/events/FactoryEventData";
import type { GenericEventData } from "$lib/data/types/events/GenericEventData";

export class FactoryEventStorage extends DataStorage<IFactoryEvent> implements IFactoryEventStorage {

    public constructor(eventDataStorage: IDataStorage<GenericEventData>, factoryEventDataStorage: IDataStorage<FactoryEventData>) {
        const list = FactoryEventStorage.getList(eventDataStorage, factoryEventDataStorage);

        super(list);
    }

    private static getList(eventDataStorage: IDataStorage<GenericEventData>, factoryEventDataStorage: IDataStorage<FactoryEventData>): IFactoryEvent[] {
        const result: IFactoryEvent[] = [];

        for (const factoryEventData of factoryEventDataStorage.list) {
            const eventData = eventDataStorage.byId.getOrThrow(factoryEventData.id);

            if (eventData.type !== "inGame") {
                throw new Error(`Expected 'inGame' type, got '${eventData.type}'`);
            }

            const item = new FactoryEvent(eventData, factoryEventData);

            result.push(item);
        }

        return result;
    }
}