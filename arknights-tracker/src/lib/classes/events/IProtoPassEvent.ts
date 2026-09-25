import type { GameEventType } from "$lib/classes/events/GameEventType";
import type { IGameEvent } from "$lib/classes/events/IGameEvent";

export interface IProtoPassEvent extends IGameEvent<GameEventType.PROTO_PASS> {
    get passWeaponIds(): readonly string[];
}