import { UserBannerProfileEntity } from "@database/entities/UserBannerProfileEntity.js";
import { NumberRecordField } from "@database/records/recordFields/NumberRecordField.js";

export class UserBannerProfileRecord {
    private readonly _profileId: bigint;
    private readonly _publicId: string;
    private readonly _privateId: string;
    private readonly _version: NumberRecordField;
    private readonly _createdAt: Date;
    private readonly _updatedAt: Date;

    public constructor(entity: UserBannerProfileEntity) {
        this._profileId = entity.profileId;
        this._publicId = entity.publicId;
        this._privateId = entity.privateId;
        this._version = new NumberRecordField(entity.version);
        this._createdAt = entity.createdAt;
        this._updatedAt = entity.updatedAt;
    }

    public get profileId(): bigint {
        return this._profileId;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get publicId(): string {
        return this._publicId;
    }

    public get privateId(): string {
        return this._privateId;
    }

    public get version(): NumberRecordField {
        return this._version;
    }

    public get updatedAt(): Date {
        return this._updatedAt;
    }
}