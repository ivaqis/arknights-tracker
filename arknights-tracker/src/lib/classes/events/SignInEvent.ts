import { GameEvent } from "$lib/classes/events/GameEvent";
import { GameEventType } from "$lib/classes/events/GameEventType";
import type { ISignInEvent } from "$lib/classes/events/ISignInEvent";
import type { SignInEventData } from "$lib/data/types/events/SignInEventData";

export class SignInEvent extends GameEvent<GameEventType.SIGN_IN> implements ISignInEvent {

    public constructor(eventData: SignInEventData) {
        super(eventData);
    }
}