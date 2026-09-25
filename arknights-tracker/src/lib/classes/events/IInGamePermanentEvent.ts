import type { GameEventType } from "$lib/classes/events/GameEventType";
import type { IGameEvent } from "$lib/classes/events/IGameEvent";

export interface IInGamePermanentEvent extends IGameEvent<GameEventType.IN_GAME_PERMANENT> {}