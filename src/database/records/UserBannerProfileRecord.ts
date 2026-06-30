import { UserBannerProfileEntity } from "@database/entities/UserBannerProfileEntity";

export class UserBannerProfileRecord {
    private readonly _profileId: bigint;
    private readonly _createdAt: Date;

    public constructor(entity: UserBannerProfileEntity) {
        this._profileId = entity.profileId;
        this._createdAt = entity.createdAt;
    }

    public get profileId(): bigint {
        return this._profileId;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }
}