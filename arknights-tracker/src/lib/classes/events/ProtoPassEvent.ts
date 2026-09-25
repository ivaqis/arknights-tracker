import { GameEvent } from "$lib/classes/events/GameEvent";
import { GameEventType } from "$lib/classes/events/GameEventType";
import type { IProtoPassEvent } from "$lib/classes/events/IProtoPassEvent";
import type { ProtoPassEventData } from "$lib/data/types/events/ProtoPassEventData";

export class ProtoPassEvent extends GameEvent<GameEventType.PROTO_PASS> implements IProtoPassEvent {
    private readonly _protoPassData: ProtoPassEventData;

    public constructor(eventData: ProtoPassEventData) {
        super(eventData);

        this._protoPassData = eventData;
    }

    public get passWeaponIds(): readonly string[] {
        return this._protoPassData.passWeapons;
    }
}