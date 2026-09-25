import type { GenericGameEvent } from "$lib/classes/events/GenericGameEvent";
import type { IInGameEvent } from "$lib/classes/events/IInGameEvent";
import type { IInGamePermanentEvent } from "$lib/classes/events/IInGamePermanentEvent";
import type { IMailEvent } from "$lib/classes/events/IMailEvent";
import type { IProtoPassEvent } from "$lib/classes/events/IProtoPassEvent";
import type { ISignInEvent } from "$lib/classes/events/ISignInEvent";
import type { IWebEvent } from "$lib/classes/events/IWebEvent";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";

export interface IGameEventStorage extends IDataStorage<GenericGameEvent> {
    get inGameEventList(): readonly IInGameEvent[];
    get inGamePermanentEventList(): readonly IInGamePermanentEvent[];
    get mailEventList(): readonly IMailEvent[];
    get protoPassEventList(): readonly IProtoPassEvent[];
    get signInEventList(): readonly ISignInEvent[];
    get webEventList(): readonly IWebEvent[];
}