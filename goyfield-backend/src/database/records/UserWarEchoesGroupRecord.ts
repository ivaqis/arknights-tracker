import { UserWarEchoesGroupEntity } from "@database/entities/UserWarEchoesGroupEntity.js";

export class UserWarEchoesGroupRecord {
    private readonly _id: string;
    private readonly _gameUid: string;
    private readonly _groupId: string;
    private readonly _difficulty: string;

    public constructor(entity: UserWarEchoesGroupEntity) {
        this._id = entity.id;
        this._gameUid = entity.gameUid;
        this._groupId = entity.groupId;
        this._difficulty = entity.difficulty;
    }

    public get id(): string {
        return this._id;
    }

    public get gameUid(): string {
        return this._gameUid;
    }

    public get groupId(): string {
        return this._groupId;
    }

    public get difficulty(): string {
        return this._difficulty;
    }
}
