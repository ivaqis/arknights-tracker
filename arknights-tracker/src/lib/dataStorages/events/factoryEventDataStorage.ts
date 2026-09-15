import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { factoryEvents } from "$lib/data/events/factoryEvents";
import type { FactoryEventData } from "$lib/data/types/events/FactoryEventData";

export const factoryEventDataStorage: IDataStorage<FactoryEventData> = new DataStorage(Object.values(factoryEvents));