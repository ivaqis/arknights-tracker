import type { GameEventType } from "$lib/classes/events/GameEventType";
import type { IGameEvent } from "$lib/classes/events/IGameEvent";

export interface ISignInEvent extends IGameEvent<GameEventType.SIGN_IN> {}