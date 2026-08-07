import { UserContractCharacterEntity } from "@database/entities/UserContractCharacterEntity.js";

export class UserContractCharacterRecord {
    private readonly _userRecordId: string;
    private readonly _charId: string;

    public constructor(entity: UserContractCharacterEntity) {
        this._userRecordId = entity.userRecordId;
        this._charId = entity.charId;
    }

    public get userRecordId(): string {
        return this._userRecordId;
    }

    public get charId(): string {
        return this._charId;
    }
}