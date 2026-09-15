import type { InGameEventData } from "$lib/data/types/events/InGameEventData";
import type { InGamePermanentEventData } from "$lib/data/types/events/InGamePermanentEventData";
import type { MailEventData } from "$lib/data/types/events/MailEventData";
import type { ProtoPassEventData } from "$lib/data/types/events/ProtoPassEventData";
import type { SignInEventData } from "$lib/data/types/events/SignInEventData";
import type { WebEventData } from "$lib/data/types/events/WebEventData";

export type GenericEventData =
    | WebEventData
    | SignInEventData
    | InGamePermanentEventData
    | InGameEventData
    | ProtoPassEventData
    | MailEventData;