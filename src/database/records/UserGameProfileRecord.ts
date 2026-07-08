import { UserGameProfileEntity } from "@database/entities/UserGameProfileEntity";
import { GameProfile } from "@models/gameProfile/GameProfile";

export class UserGameProfileRecord {
    private readonly _gameUid: string;
    private readonly _uid: bigint;

    private _data: GameProfile;

    public constructor(entity: UserGameProfileEntity) {
        this._gameUid = entity.gameUid;
        this._uid = entity.uid;
        this._data = GameProfile.getFromEntity(JSON.parse(entity.data));
    }

    public get gameUid(): string {
        return this._gameUid;
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
}