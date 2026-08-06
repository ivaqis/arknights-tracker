import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord";
import { Repository } from "@database/repositories/Repository";
import { UserGameProfilesTable } from "@database/tables/UserGameProfilesTable";
import { PrismaClient } from "@generated/prisma-v2";

export class GameProfilesRepository extends Repository {
    private readonly _gameProfilesTable: UserGameProfilesTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._gameProfilesTable = new UserGameProfilesTable(prisma);
    }

    public async find(gameUid: string): Promise<UserGameProfileRecord | null> {
        return this._gameProfilesTable.find(gameUid);
    }

    public async findMany(gameUids: string[]): Promise<UserGameProfileRecord[]> {
        return this._gameProfilesTable.findMany(gameUids);
    }

    public async findByUid(uid: bigint, serverId?: string): Promise<UserGameProfileRecord[]> {
        return this._gameProfilesTable.findByUid(uid, serverId);
    }

    public async findByBannerProfileId(profileId: bigint): Promise<UserGameProfileRecord | null> {
        return this._gameProfilesTable.findByBannerProfileId(profileId);
    }

    public async upsert(record: UserGameProfileRecord): Promise<void> {
        return this._gameProfilesTable.upsert(record);
    }

    public async delete(gameUid: string): Promise<void> {
        return this._gameProfilesTable.delete(gameUid);
    }

    public async deleteByUid(uid: bigint): Promise<void> {
        return this._gameProfilesTable.deleteByUid(uid);
    }
}