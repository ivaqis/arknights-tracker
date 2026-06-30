import { UserWeaponBannerPullsEntity } from "@database/entities/UserWeaponBannerPullsEntity";
import { BigIntRecordField } from "@database/records/recordFields/BigIntRecordField";
import { NumberRecordField } from "@database/records/recordFields/NumberRecordField";

export class UserWeaponBannerPullsRecord {
    private readonly _profileId: bigint;
    private readonly _bannerId: string;
    private readonly _updatedAt: Date;

    private readonly _last6Pull: NumberRecordField;
    private readonly _last5Pull: NumberRecordField;
    private readonly _lastWin5050Pull: NumberRecordField;
    private readonly _lastPullTimeTs: BigIntRecordField;

    public constructor(entity: UserWeaponBannerPullsEntity) {
        this._profileId = entity.profileId;
        this._bannerId = entity.bannerId;
        this._updatedAt = entity.updatedAt;

        this._last6Pull = new NumberRecordField(entity.last6Pull);
        this._last5Pull = new NumberRecordField(entity.last5Pull);
        this._lastWin5050Pull = new NumberRecordField(entity.lastWin5050Pull);
        this._lastPullTimeTs = new BigIntRecordField(entity.lastPullTimeTs);
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

    public get last6Pull(): NumberRecordField {
        return this._last6Pull;
    }

    public get last5Pull(): NumberRecordField {
        return this._last5Pull;
    }

    public get lastWin5050Pull(): NumberRecordField {
        return this._lastWin5050Pull;
    }

    public get lastPullTimeTs(): BigIntRecordField {
        return this._lastPullTimeTs;
    }
}