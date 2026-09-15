import type { GameEventType } from "$lib/classes/events/GameEventType";
import type { IGameEvent } from "$lib/classes/events/IGameEvent";

export interface IInGameEvent extends IGameEvent<GameEventType.IN_GAME> {}