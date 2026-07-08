import { UserGameProfileEntity } from "@database/entities/UserGameProfileEntity";
import { GameProfile } from "@models/gameProfile/GameProfile";

export class UserGameProfileRecord {
    private readonly _gameUid: string;
    private readonly _serverId: string;
    private readonly _uid: bigint;

    private _data: GameProfile;

    public constructor(entity: UserGameProfileEntity) {
        this._gameUid = entity.gameUid;
        this._serverId = entity.serverId;
        this._uid = entity.uid;
        this._data = GameProfile.getFromEntity(JSON.parse(entity.data));
    }

    public get gameUid(): string {
        return this._gameUid;
    }

    public get serverId(): string {
        return this._serverId;
    }

    public get uid(): bigint {
        return this._uid;
    }

    public get data(): GameProfile {
        return this._data;
    }

    public set data(value: GameProfile) {
        this._data = value;
    }

    public getStringData(): string {
        return JSON.stringify(this.data.getEntity());
    }
}