import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord";
import { UserMonumentGroupRecord } from "@database/records/UserMonumentGroupRecord";
import { UserMonumentLeaderboardRecord } from "@database/records/UserMonumentLeaderboardRecord";
import { UserRecord } from "@database/records/UserRecord";
import { Repository } from "@database/repositories/Repository";
import { UserMonumentGroupsTable } from "@database/tables/UserMonumentGroupsTable";
import { UserMonumentLeaderboardsTable } from "@database/tables/UserMonumentLeaderboardsTable";
import { MonumentRecord } from "@models/monument/MonumentRecord";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";
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

    public async findManyByUserGroupIdIncludeGameProfileAndUser(userGroupIds: string[]): Promise<{
        monumentRecord: UserMonumentLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        return this._monumentTable.findManyByUserGroupIdIncludeGameProfileAndUser(userGroupIds);
    }

    public async findByDungeonIdIncludeGameProfileAndUser(dungeonId: string, publicOnly: boolean, serverId: string | null): Promise<{
        monumentRecord: UserMonumentLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]>;
    public async findByDungeonIdIncludeGameProfileAndUser(dungeonId: string,
                                                          publicOnly: boolean,
                                                          serverId: string | null,
                                                          sortField?: MonumentLeaderboardSortField,
                                                          sortOrder?: SortOrder,
                                                          take?: number,
                                                          skip?: number
    ): Promise<{
        monumentRecord: UserMonumentLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]>;

    public async findByDungeonIdIncludeGameProfileAndUser(dungeonId: string,
                                                          publicOnly: boolean,
                                                          serverId: string | null,
                                                          sortField?: MonumentLeaderboardSortField,
                                                          sortOrder?: SortOrder,
                                                          take?: number,
                                                          skip?: number
    ): Promise<{
        monumentRecord: UserMonumentLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        return this._monumentTable.findByDungeonIdIncludeGameProfileAndUser(dungeonId, publicOnly, serverId, sortField, sortOrder, take, skip);
    }

    public async findManyByUserGroupId(userGroupIds: string[]): Promise<UserMonumentLeaderboardRecord[]> {
        return this._monumentTable.findManyByUserGroupId(userGroupIds);
    }

    public async sumClearTimeByUserGroupIdSorted(groupId: string,
                                                 isHard: boolean,
                                                 publicOnly: boolean,
                                                 serverId: string | null,
                                                 sortOrder: SortOrder,
                                                 minCountInGroup: number = 0,
                                                 take?: number,
                                                 skip?: number
    ): Promise<{
        userGroupId: string,
        clearTimeSec: number
    }[]> {
        return this._monumentTable.sumClearTimeByUserGroupIdSorted(groupId, isHard, publicOnly, serverId, sortOrder, minCountInGroup, take, skip);
    }

    public async findUserGroupsByGroupIdSortedByLevel(groupId: string,
                                                      isHard: boolean,
                                                      publicOnly: boolean,
                                                      serverId: string | null,
                                                      sortOrder: SortOrder,
                                                      minCountInGroup: number = 0,
                                                      take: number,
                                                      skip: number
    ): Promise<string[]> {
        return this._monumentGroupsTable.findByGroupIdSortedByLevel(groupId, isHard, publicOnly, serverId, sortOrder, minCountInGroup, take, skip);
    }

    public async findByGroupIdIncludeGameProfileAndUser(groupId: string,
                                                        isHard: boolean,
                                                        publicOnly: boolean,
                                                        serverId: string | null,
                                                        sortField: MonumentLeaderboardSortField,
                                                        sortOrder: SortOrder,
                                                        minCountInGroup: number,
                                                        take: number,
                                                        skip: number
    ): Promise<{
        monumentRecord: UserMonumentLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        let groups: string[];

        switch (sortField) {
            case MonumentLeaderboardSortField.LEVEL:
                groups = await this.findUserGroupsByGroupIdSortedByLevel(groupId, isHard, publicOnly, serverId, sortOrder, minCountInGroup, take, skip);
                break;

            case MonumentLeaderboardSortField.TIME:
                const times = await this.sumClearTimeByUserGroupIdSorted(groupId, isHard, publicOnly, serverId, sortOrder, minCountInGroup, take, skip);

                groups = times.map(item => item.userGroupId);
        }

        return await this.findManyByUserGroupIdIncludeGameProfileAndUser(groups);
    }

    public async findUserGroupsByGroupId(groupId: string,
                                         isHard: boolean,
                                         publicOnly: boolean,
                                         serverId: string | null,
                                         sortField: MonumentLeaderboardSortField,
                                         sortOrder: SortOrder,
                                         minCountInGroup: number,
                                         take: number,
                                         skip: number
    ): Promise<string[]> {
        switch (sortField) {
            case MonumentLeaderboardSortField.LEVEL:
                return await this.findUserGroupsByGroupIdSortedByLevel(groupId, isHard, publicOnly, serverId, sortOrder, minCountInGroup, take, skip);
            case MonumentLeaderboardSortField.TIME:
                const times = await this.sumClearTimeByUserGroupIdSorted(groupId, isHard, publicOnly, serverId, sortOrder, minCountInGroup, take, skip);
                return times.map(item => item.userGroupId);
        }
    }

    public async findManyUserGroups(ids: string[]): Promise<UserMonumentGroupRecord[]> {
        return this._monumentGroupsTable.findMany(ids);
    }

    public async countByGroupId(groupId: string, isHard: boolean, publicOnly: boolean, serverId: string | null): Promise<number> {
        return this._monumentTable.countByGroupId(groupId, isHard, publicOnly, serverId);
    }

    public async countByDungeonId(dungeonId: string, publicOnly: boolean, serverId: string | null): Promise<number> {
        return this._monumentTable.countByDungeonId(dungeonId, publicOnly, serverId);
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