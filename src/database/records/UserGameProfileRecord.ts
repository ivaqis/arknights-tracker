import { UserGameProfileEntity } from "@database/entities/UserGameProfileEntity";
import { GameProfile } from "@models/gameProfile/GameProfile";

export class UserGameProfileRecord {
    private readonly _gameUid: string;
    private readonly _serverId: string;
    private readonly _uid: bigint;

    private _data: GameProfile;

    private constructor(gameUid: string, serverId: string, uid: bigint, data: GameProfile) {
        this._gameUid = gameUid;
        this._serverId = serverId;
        this._uid = uid;
        this._data = data;
    }

    public static createFromData(gameUid: string, serverId: string, uid: bigint, data: GameProfile): UserGameProfileRecord {
        return new UserGameProfileRecord(
            gameUid,
            serverId,
            uid,
            data
        );
    }

    public static createFromEntity(entity: UserGameProfileEntity): UserGameProfileRecord {
        return new UserGameProfileRecord(
            entity.gameUid,
            entity.serverId,
            entity.uid,
            GameProfile.getFromEntity(JSON.parse(entity.data))
        );
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