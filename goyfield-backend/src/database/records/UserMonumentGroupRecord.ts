import { UserMonumentGroupEntity } from "@database/entities/UserMonumentGroupEntity.js";

export class UserMonumentGroupRecord {
    private readonly _id: string;
    private readonly _gameUid: string;
    private readonly _groupId: string;
    private readonly _isHard: boolean;

    public constructor(entity: UserMonumentGroupEntity) {
        this._id = entity.id;
        this._gameUid = entity.gameUid;
        this._groupId = entity.groupId;
        this._isHard = entity.isHard;
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

    public get isHard(): boolean {
        return this._isHard;
    }
}