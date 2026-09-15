import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { rawEvents } from "$lib/data/timeline";
import type { GenericEventData } from "$lib/data/types/events/GenericEventData";

export const gameEventDataStorage: IDataStorage<GenericEventData> = new DataStorage(rawEvents);