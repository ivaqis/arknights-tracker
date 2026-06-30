import { GeneratedTokenEntity } from "@database/entities/GeneratedTokenEntity";

export class GeneratedTokenRecord {
    private readonly _token: string;
    private readonly _profileId: bigint;

    public constructor(entity: GeneratedTokenEntity) {
        this._token = entity.token;
        this._profileId = entity.profileId;
    }

    public get token(): string {
        return this._token;
    }

    public get profileId(): bigint {
        return this._profileId;
    }
}