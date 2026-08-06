import { BannerPullsIdRecord } from "@database/records/BannerPullsIdRecord";
import { BannerTokenIdRecord } from "@database/records/BannerTokenIdRecord";
import { UserBannerProfileRecord } from "@database/records/UserBannerProfileRecord";
import { Repository } from "@database/repositories/Repository";
import { BannerPullsIdsTable } from "@database/tables/BannerPullsIdsTable";
import { BannerTokenIdsTable } from "@database/tables/BannerTokenIdsTable";
import { UserBannerProfilesTable } from "@database/tables/UserBannerProfilesTable";
import { PrismaClient } from "@generated/prisma-v2";

export class UserBannerProfilesRepository extends Repository {
    private readonly _userBannerProfilesTable: UserBannerProfilesTable;
    private readonly _tokenIdsTable: BannerTokenIdsTable;
    private readonly _pullsIdsTable: BannerPullsIdsTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._userBannerProfilesTable = new UserBannerProfilesTable(prisma);
        this._tokenIdsTable = new BannerTokenIdsTable(prisma);
        this._pullsIdsTable = new BannerPullsIdsTable(prisma);
    }

    public async findUserBannerProfile(profileId: bigint): Promise<UserBannerProfileRecord | null> {
        return this._userBannerProfilesTable.find(profileId);
    }

    public async findUserBannerProfileByPublicId(publicId: string): Promise<UserBannerProfileRecord | null> {
        return this._userBannerProfilesTable.findByPublicId(publicId);
    }

    public async findUserBannerProfileByPrivateId(privateId: string): Promise<UserBannerProfileRecord | null> {
        return this._userBannerProfilesTable.findByPrivateId(privateId);
    }

    public async updateUserBannerProfile(record: UserBannerProfileRecord): Promise<void> {
        return this._userBannerProfilesTable.update(record);
    }

    public async createUserBannerProfile(): Promise<UserBannerProfileRecord> {
        return this._userBannerProfilesTable.create();
    }

    public async createTokenId(id: string, profileId: bigint): Promise<BannerTokenIdRecord> {
        return this._tokenIdsTable.create(id, profileId);
    }

    public async setTokenId(id: string, profileId: bigint): Promise<BannerTokenIdRecord> {
        return this._tokenIdsTable.set(id, profileId);
    }

    public async findTokenId(id: string): Promise<BannerTokenIdRecord | null> {
        return this._tokenIdsTable.find(id);
    }

    public async findTokenIdIncludeBannerProfile(id: string): Promise<{
        tokenId: BannerTokenIdRecord,
        profile: UserBannerProfileRecord
    } | null> {
        return this._tokenIdsTable.findIncludeBannerProfile(id);
    }

    public async createPullsId(id: string, period: number, profileId: bigint): Promise<BannerPullsIdRecord> {
        return this._pullsIdsTable.create(id, period, profileId);
    }

    public async setPullsId(id: string, period: number, profileId: bigint): Promise<BannerPullsIdRecord> {
        return this._pullsIdsTable.set(id, period, profileId);
    }

    public async findPullsId(id: string): Promise<BannerPullsIdRecord | null> {
        return this._pullsIdsTable.find(id);
    }

    public async findFirstPullsId(ids: string[]): Promise<BannerPullsIdRecord | null> {
        return this._pullsIdsTable.findFirst(ids);
    }

    public async findPullsIdIncludeBannerProfile(id: string): Promise<{
        pullsId: BannerPullsIdRecord,
        profile: UserBannerProfileRecord
    } | null> {
        return this._pullsIdsTable.findIncludeBannerProfile(id);
    }

    public async findFirstPullsIdIncludeBannerProfile(ids: string[]): Promise<{
        pullsId: BannerPullsIdRecord,
        profile: UserBannerProfileRecord
    } | null> {
        return this._pullsIdsTable.findFirstIncludeBannerProfile(ids);
    }
}