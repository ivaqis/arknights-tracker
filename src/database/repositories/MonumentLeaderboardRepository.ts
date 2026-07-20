import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord";
import { UserMonumentLeaderboardRecord } from "@database/records/UserMonumentLeaderboardRecord";
import { UserRecord } from "@database/records/UserRecord";
import { Repository } from "@database/repositories/Repository";
import { UserMonumentGroupsTable } from "@database/tables/UserMonumentGroupsTable";
import { UserMonumentLeaderboardsTable } from "@database/tables/UserMonumentLeaderboardsTable";
import { MonumentRecord } from "@models/monument/MonumentRecord";
import { PrismaClient } from "@prisma/client";

export class MonumentLeaderboardRepository extends Repository {
    private readonly _monumentGroupsTable: UserMonumentGroupsTable;
    private readonly _monumentTable: UserMonumentLeaderboardsTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._monumentGroupsTable = new UserMonumentGroupsTable(prisma);
        this._monumentTable = new UserMonumentLeaderboardsTable(prisma);
    }

    public async find(id: string): Promise<UserMonumentLeaderboardRecord | null> {
        return this._monumentTable.find(id);
    }

    public async findIncludeGameProfileAndUser(id: string): Promise<{
        record: UserMonumentLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    } | null> {
        return this._monumentTable.findIncludeGameProfileAndUser(id);
    }

    public async findByGameUid(gameUid: string, dungeonId?: string): Promise<UserMonumentLeaderboardRecord[]> {
        return this._monumentTable.findByGameUid(gameUid, dungeonId);
    }

    public async findByDungeonId(dungeonId: string): Promise<UserMonumentLeaderboardRecord[]> {
        return this._monumentTable.findByDungeonId(dungeonId);
    }

    public async findByGroupId(groupId: string, isHard?: boolean, gameUid?: string): Promise<UserMonumentLeaderboardRecord[]> {
        return this._monumentTable.findByGroupId(groupId, isHard, gameUid);
    }

    public async findByUserGroupId(userGroupId: string): Promise<UserMonumentLeaderboardRecord[]> {
        return this._monumentTable.findByUserGroupId(userGroupId);
    }

    public async create(gameUid: string, data: MonumentRecord): Promise<UserMonumentLeaderboardRecord> {
        const group = await this._monumentGroupsTable.getByGroupId(data.groupId, data.isHard, gameUid);

        return await this._monumentTable.create(group.id, gameUid, data);
    }

    public async delete(id: string): Promise<void> {
        return this._monumentTable.delete(id);
    }

    public async deleteByGameUid(gameUid: string, dungeonId?: string): Promise<void> {
        return this._monumentTable.deleteByGameUid(gameUid, dungeonId);
    }
}