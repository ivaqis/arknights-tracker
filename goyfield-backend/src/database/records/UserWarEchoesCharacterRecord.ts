import { UserWarEchoesCharacterEntity } from "@database/entities/UserWarEchoesCharacterEntity.js";

export class UserWarEchoesCharacterRecord {
    private readonly _recordId: string;
    private readonly _userGroupId: string;
    private readonly _charId: string;

    public constructor(entity: UserWarEchoesCharacterEntity) {
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
