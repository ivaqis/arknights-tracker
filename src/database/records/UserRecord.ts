import { UserEntity } from "@database/entities/UserEntity";
import { BooleanRecordField } from "@database/records/recordFields/BooleanRecordField";
import { DateRecordField } from "@database/records/recordFields/DateRecordField";
import { NullableStringRecordField } from "@database/records/recordFields/NullableStringRecordField";
import { NumberRecordField } from "@database/records/recordFields/NumberRecordField";
import { StringRecordField } from "@database/records/recordFields/StringRecordField";

export class UserRecord {
    private readonly _uid: bigint;
    private readonly _publicUid: StringRecordField;
    private readonly _firebaseUid: NullableStringRecordField;
    private readonly _isPrivate: BooleanRecordField;
    private readonly _avatarId: NullableStringRecordField;
    private readonly _backgroundId: NullableStringRecordField;
    private readonly _displayAvatar: BooleanRecordField;
    private readonly _uploadCount: NumberRecordField;
    private readonly _lastUploadReset: DateRecordField;
    private readonly _createdAt: Date;
    private readonly _updatedAt: Date;

    public constructor(entity: UserEntity) {
        this._uid = entity.uid;
        this._publicUid = new StringRecordField(entity.publicUid);
        this._firebaseUid = new NullableStringRecordField(entity.firebaseUid);
        this._isPrivate = new BooleanRecordField(entity.isPrivate);
        this._avatarId = new NullableStringRecordField(entity.avatarId);
        this._backgroundId = new NullableStringRecordField(entity.backgroundId);
        this._displayAvatar = new BooleanRecordField(entity.displayAvatar);
        this._uploadCount = new NumberRecordField(entity.uploadCount);
        this._lastUploadReset = new DateRecordField(entity.lastUploadReset);
        this._createdAt = entity.createdAt;
        this._updatedAt = entity.updatedAt;
    }

    public get uid(): bigint {
        return this._uid;
    }

    public get publicUid(): StringRecordField {
        return this._publicUid;
    }

    public get firebaseUid(): NullableStringRecordField {
        return this._firebaseUid;
    }

    public get isPrivate(): BooleanRecordField {
        return this._isPrivate;
    }

    public get avatarId(): NullableStringRecordField {
        return this._avatarId;
    }

    public get backgroundId(): NullableStringRecordField {
        return this._backgroundId;
    }

    public get displayAvatar(): BooleanRecordField {
        return this._displayAvatar;
    }

    public get uploadCount(): NumberRecordField {
        return this._uploadCount;
    }

    public get lastUploadReset(): DateRecordField {
        return this._lastUploadReset;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get updatedAt(): Date {
        return this._updatedAt;
    }

    public resetUploadsIfMust(): void {
        if (this.mustResetUploads()) {
            this.resetUploads();
        }
    }

    public resetUploads(): void {
        this.uploadCount.value = 0;
        this.lastUploadReset.value = new Date();
    }

    public mustResetUploads(): boolean {
        const now = new Date();
        const resetDate = this.lastUploadReset.initValue;

        return now.getFullYear() !== resetDate.getFullYear()
            || now.getMonth() !== resetDate.getMonth();
    }
}