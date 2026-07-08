import { UserBannerProfileEntity } from "@database/entities/UserBannerProfileEntity";
import { NullableStringRecordField } from "@database/records/recordFields/NullableStringRecordField";

export class UserBannerProfileRecord {
    private readonly _profileId: bigint;
    private readonly _gameUid: NullableStringRecordField;
    private readonly _createdAt: Date;

    public constructor(entity: UserBannerProfileEntity) {
        this._profileId = entity.profileId;
        this._gameUid = new NullableStringRecordField(entity.gameUid);
        this._createdAt = entity.createdAt;
    }

    public get profileId(): bigint {
        return this._profileId;
    }

    get gameUid(): NullableStringRecordField {
        return this._gameUid;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }
}