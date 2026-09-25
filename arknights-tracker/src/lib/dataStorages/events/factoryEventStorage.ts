import { FactoryEventStorage } from "$lib/classes/storages/events/FactoryEventStorage";
import type { IFactoryEventStorage } from "$lib/classes/storages/events/IFactoryEventStorage";
import { factoryEventDataStorage } from "$lib/dataStorages/events/factoryEventDataStorage";
import { gameEventDataStorage } from "$lib/dataStorages/events/gameEventDataStorage";

export const factoryEventStorage: IFactoryEventStorage = new FactoryEventStorage(gameEventDataStorage, factoryEventDataStorage);