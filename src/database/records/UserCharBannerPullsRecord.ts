import { UserCharBannerPullsEntity } from "@database/entities/UserCharBannerPullsEntity";
import { NumberRecordField } from "@database/records/recordFields/NumberRecordField";

export class UserCharBannerPullsRecord {
    private readonly _profileId: bigint;
    private readonly _bannerId: string;
    private readonly _updatedAt: Date;

    private readonly _last6LimitedPull: NumberRecordField;

    public constructor(entity: UserCharBannerPullsEntity) {
        this._profileId = entity.profileId;
        this._bannerId = entity.bannerId;
        this._updatedAt = entity.updatedAt;

        this._last6LimitedPull = new NumberRecordField(entity.last6LimitedPull);
    }

    public get profileId(): bigint {
        return this._profileId;
    }

    public get bannerId(): string {
        return this._bannerId;
    }

    public get updatedAt(): Date {
        return this._updatedAt;
    }

    public get last6LimitedPull(): NumberRecordField {
        return this._last6LimitedPull;
    }
}