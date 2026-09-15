import type { IFactoryEvent } from "$lib/classes/events/IFactoryEvent";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";

export interface IFactoryEventStorage extends IDataStorage<IFactoryEvent> {}