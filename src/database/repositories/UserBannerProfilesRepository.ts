import { GeneratedTokenRecord } from "@database/records/GeneratedTokenRecord";
import { UserBannerProfileRecord } from "@database/records/UserBannerProfileRecord";
import { Repository } from "@database/repositories/Repository";
import { GeneratedTokensTable } from "@database/tables/GeneratedTokensTable";
import { UserBannerProfilesTable } from "@database/tables/UserBannerProfilesTable";
import { PrismaClient } from "@prisma/client";

export class UserBannerProfilesRepository extends Repository {
    private readonly _userBannerProfilesTable: UserBannerProfilesTable;
    private readonly _generatedTokensTable: GeneratedTokensTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._userBannerProfilesTable = new UserBannerProfilesTable(prisma);
        this._generatedTokensTable = new GeneratedTokensTable(prisma);
    }

    public async getUserBannerProfile(profileId: bigint): Promise<UserBannerProfileRecord | null> {
        return this._userBannerProfilesTable.get(profileId);
    }

    public async getUserBannerProfileByGameUid(gameUid: string): Promise<UserBannerProfileRecord | null> {
        return this._userBannerProfilesTable.findByGameUid(gameUid);
    }

    /**
     * Returns true if gameUid was found and removed.
     * Else if gameUid not found, returns false.
     * @param gameUid
     */
    public async removeGameUidLink(gameUid: string): Promise<boolean> {
        const record = await this.getUserBannerProfileByGameUid(gameUid);

        if (!record) {
            return false;
        }

        record.gameUid.value = null;

        await this._userBannerProfilesTable.update(record);

        return true;
    }

    public async createUserBannerProfile(): Promise<UserBannerProfileRecord> {
        return this._userBannerProfilesTable.create();
    }

    public async getGeneratedTokenRecord(token: string): Promise<GeneratedTokenRecord | null> {
        return this._generatedTokensTable.get(token);
    }

    public async createGeneratedTokenRecord(token: string, profileId: bigint): Promise<GeneratedTokenRecord> {
        return this._generatedTokensTable.create(token, profileId);
    }

    public async getOrCreateProfileByToken(token: string): Promise<UserBannerProfileRecord> {
        let profile: UserBannerProfileRecord | null = null;
        let tokenRecord = await this._generatedTokensTable.get(token);

        if (tokenRecord) {
            profile = await this.getUserBannerProfile(tokenRecord.profileId);
        }

        if (!profile) {
            profile = await this.createUserBannerProfile();
        }

        if (!tokenRecord) {
            await this.createGeneratedTokenRecord(token, profile.profileId);
        }

        return profile;
    }
}