import { GameEventType } from "$lib/classes/events/GameEventType";
import type { IGameEvent } from "$lib/classes/events/IGameEvent";

export interface IWebEvent extends IGameEvent<GameEventType.WEB> {
    get webUrl(): string | null;
}