import { GameEventStorage } from "$lib/classes/storages/events/GameEventStorage";
import type { IGameEventStorage } from "$lib/classes/storages/events/IGameEventStorage";
import { gameEventDataStorage } from "$lib/dataStorages/events/gameEventDataStorage";

export const gameEventStorage: IGameEventStorage = new GameEventStorage(gameEventDataStorage);