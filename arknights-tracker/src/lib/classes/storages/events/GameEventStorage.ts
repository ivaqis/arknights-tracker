import { GameEventType } from "$lib/classes/events/GameEventType";
import type { GenericGameEvent } from "$lib/classes/events/GenericGameEvent";
import type { IInGameEvent } from "$lib/classes/events/IInGameEvent";
import type { IInGamePermanentEvent } from "$lib/classes/events/IInGamePermanentEvent";
import type { IMailEvent } from "$lib/classes/events/IMailEvent";
import { InGameEvent } from "$lib/classes/events/InGameEvent";
import { InGamePermanentEvent } from "$lib/classes/events/InGamePermanentEvent";
import type { IProtoPassEvent } from "$lib/classes/events/IProtoPassEvent";
import type { ISignInEvent } from "$lib/classes/events/ISignInEvent";
import type { IWebEvent } from "$lib/classes/events/IWebEvent";
import { MailEvent } from "$lib/classes/events/MailEvent";
import { ProtoPassEvent } from "$lib/classes/events/ProtoPassEvent";
import { SignInEvent } from "$lib/classes/events/SignInEvent";
import { WebEvent } from "$lib/classes/events/WebEvent";
import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IGameEventStorage } from "$lib/classes/storages/events/IGameEventStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { GenericEventData } from "$lib/data/types/events/GenericEventData";

export class GameEventStorage extends DataStorage<GenericGameEvent> implements IGameEventStorage {
    private readonly _inGameEventList: IInGameEvent[];
    private readonly _inGamePermanentEventList: IInGamePermanentEvent[];
    private readonly _mailEventList: IMailEvent[];
    private readonly _protoPassEventList: IProtoPassEvent[];
    private readonly _signInEventList: ISignInEvent[];
    private readonly _webEventList: IWebEvent[];

    public constructor(dataStorage: IDataStorage<GenericEventData>) {
        const list = GameEventStorage.getList(dataStorage.list);

        super(list);

        this._inGameEventList = list.filter(v => v.type === GameEventType.IN_GAME);
        this._inGamePermanentEventList = list.filter(v => v.type === GameEventType.IN_GAME_PERMANENT);
        this._mailEventList = list.filter(v => v.type === GameEventType.MAIL);
        this._protoPassEventList = list.filter(v => v.type === GameEventType.PROTO_PASS);
        this._signInEventList = list.filter(v => v.type === GameEventType.SIGN_IN);
        this._webEventList = list.filter(v => v.type === GameEventType.WEB);
    }

    private static getList(dataList: readonly GenericEventData[]): GenericGameEvent[] {
        const result: GenericGameEvent[] = [];

        for (const data of dataList) {
            let item: GenericGameEvent;

            switch (data.type) {
                case "inGame":
                    item = new InGameEvent(data);
                    break;
                case "inGamePermanent":
                    item = new InGamePermanentEvent(data);
                    break;
                case "mailEvent":
                    item = new MailEvent(data);
                    break;
                case "web":
                    item = new WebEvent(data);
                    break;
                case "protoPass":
                    item = new ProtoPassEvent(data);
                    break;
                case "signIn":
                    item = new SignInEvent(data);
                    break;
            }

            result.push(item);
        }

        return result;
    }

    public get inGameEventList(): readonly IInGameEvent[] {
        return this._inGameEventList;
    }

    public get inGamePermanentEventList(): readonly IInGamePermanentEvent[] {
        return this._inGamePermanentEventList;
    }

    public get mailEventList(): readonly IMailEvent[] {
        return this._mailEventList;
    }

    public get protoPassEventList(): readonly IProtoPassEvent[] {
        return this._protoPassEventList;
    }

    public get signInEventList(): readonly ISignInEvent[] {
        return this._signInEventList;
    }

    public get webEventList(): readonly IWebEvent[] {
        return this._webEventList;
    }
}