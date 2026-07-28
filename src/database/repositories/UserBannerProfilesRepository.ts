import { UserBannerProfileRecord } from "@database/records/UserBannerProfileRecord";
import { Repository } from "@database/repositories/Repository";
import { UserBannerProfilesTable } from "@database/tables/UserBannerProfilesTable";
import { PrismaClient } from "@prisma/client";

export class UserBannerProfilesRepository extends Repository {
    private readonly _userBannerProfilesTable: UserBannerProfilesTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._userBannerProfilesTable = new UserBannerProfilesTable(prisma);
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
}