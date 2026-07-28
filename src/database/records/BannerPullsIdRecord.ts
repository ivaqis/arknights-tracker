import { BannerPullsIdEntity } from "@database/entities/BannerPullsIdEntity";

export class BannerPullsIdRecord {
    private readonly _id: string;
    private readonly _period: number;
    private readonly _profileId: bigint;
    private readonly _createdAt: Date;

    private constructor(id: string, period: number, profileId: bigint, createdAt: Date) {
        this._id = id;
        this._period = period;
        this._profileId = profileId;
        this._createdAt = createdAt;
    }

    public static createFromEntity(entity: BannerPullsIdEntity): BannerPullsIdRecord {
        return new BannerPullsIdRecord(
            entity.id,
            entity.period,
            entity.profileId,
            entity.createdAt
        );
    }

    public get id(): string {
        return this._id;
    }

    public get period(): number {
        return this._period;
    }

    public get profileId(): bigint {
        return this._profileId;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }
}