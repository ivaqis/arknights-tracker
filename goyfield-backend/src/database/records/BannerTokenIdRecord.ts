import { BannerTokenIdEntity } from "@database/entities/BannerTokenIdEntity.js";

export class BannerTokenIdRecord {
    private readonly _id: string;
    private readonly _profileId: bigint;
    private readonly _createdAt: Date;

    private constructor(id: string, profileId: bigint, createdAt: Date) {
        this._id = id;
        this._profileId = profileId;
        this._createdAt = createdAt;
    }

    public static createFromEntity(entity: BannerTokenIdEntity): BannerTokenIdRecord {
        return new BannerTokenIdRecord(
            entity.id,
            entity.profileId,
            entity.createdAt
        );
    }

    public get id(): string {
        return this._id;
    }

    public get profileId(): bigint {
        return this._profileId;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }
}