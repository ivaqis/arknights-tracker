import { UserMonumentCharacterEntity } from "@database/entities/UserMonumentCharacterEntity";

export class UserMonumentCharacterRecord {
    private readonly _recordId: string;
    private readonly _userGroupId: string;
    private readonly _charId: string;

    public constructor(entity: UserMonumentCharacterEntity) {
        this._recordId = entity.recordId;
        this._userGroupId = entity.userGroupId;
        this._charId = entity.charId;
    }

    public get recordId(): string {
        return this._recordId;
    }

    public get userGroupId(): string {
        return this._userGroupId;
    }

    public get charId(): string {
        return this._charId;
    }
}