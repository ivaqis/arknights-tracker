import type { IInGameEvent } from "$lib/classes/events/IInGameEvent";
import type { IInGamePermanentEvent } from "$lib/classes/events/IInGamePermanentEvent";
import type { IMailEvent } from "$lib/classes/events/IMailEvent";
import type { IProtoPassEvent } from "$lib/classes/events/IProtoPassEvent";
import type { ISignInEvent } from "$lib/classes/events/ISignInEvent";
import type { IWebEvent } from "$lib/classes/events/IWebEvent";

export type GenericGameEvent =
    | IInGameEvent
    | IInGamePermanentEvent
    | IMailEvent
    | IProtoPassEvent
    | ISignInEvent
    | IWebEvent;