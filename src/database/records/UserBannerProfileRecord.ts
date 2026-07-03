import { UserBannerProfileEntity } from "@database/entities/UserBannerProfileEntity";

export class UserBannerProfileRecord {
    private readonly _profileId: bigint;
    private readonly _gameUid: string | null;
    private readonly _createdAt: Date;

    public constructor(entity: UserBannerProfileEntity) {
        this._profileId = entity.profileId;
        this._gameUid = entity.gameUid;
        this._createdAt = entity.createdAt;
    }

    public get profileId(): bigint {
        return this._profileId;
    }

    get gameUid(): string | null {
        return this._gameUid;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }
}