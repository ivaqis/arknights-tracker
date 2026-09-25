import { UserMonumentCharacterEntity } from "@database/entities/UserMonumentCharacterEntity.js";
import { MonumentFilters } from "@database/MonumentFilters.js";
import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord.js";
import { UserMonumentCharacterRecord } from "@database/records/UserMonumentCharacterRecord.js";
import { UserMonumentGroupRecord } from "@database/records/UserMonumentGroupRecord.js";
import { UserMonumentLeaderboardRecord } from "@database/records/UserMonumentLeaderboardRecord.js";
import { UserRecord } from "@database/records/UserRecord.js";
import { Repository } from "@database/repositories/Repository.js";
import { UserMonumentCharactersTable } from "@database/tables/UserMonumentCharactersTable.js";
import { UserMonumentGroupsTable } from "@database/tables/UserMonumentGroupsTable.js";
import { UserMonumentLeaderboardsTable } from "@database/tables/UserMonumentLeaderboardsTable.js";
import { PrismaClient } from "@generated/prisma-v2/index.js";
import { Amount } from "@models/Amount.js";
import { MonumentRecord } from "@models/monument/MonumentRecord.js";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";

export class MonumentLeaderboardRepository extends Repository {
    private readonly _monumentGroupsTable: UserMonumentGroupsTable;
    private readonly _monumentTable: UserMonumentLeaderboardsTable;
    private readonly _characterTable: UserMonumentCharactersTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._monumentGroupsTable = new UserMonumentGroupsTable(prisma);
        this._monumentTable = new UserMonumentLeaderboardsTable(prisma);
        this._characterTable = new UserMonumentCharactersTable(prisma);
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

    public async findManyGroupsIncludeGameProfileAndUser(userGroupIds: string[]): Promise<{
        group: UserMonumentGroupRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        return this._monumentGroupsTable.findManyIncludeGameProfileAndUser(userGroupIds);
    }

    public async findByDungeonIdIncludeGameProfileAndUser(dungeonId: string,
                                                          publicOnly: boolean,
                                                          serverId: string | null,
                                                          sortField: MonumentLeaderboardSortField,
                                                          sortOrder: SortOrder,
                                                          filters: MonumentFilters,
                                                          take?: number,
                                                          skip?: number
    ): Promise<{
        record: UserMonumentLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        const ids = await this._monumentTable.findIdsByDungeonId(dungeonId, publicOnly, serverId, sortField, sortOrder, filters, take, skip);

        return await this._monumentTable.findManyIncludeGameProfileAndUser(ids);
    }

    public async findManyByUserGroupId(userGroupIds: string[]): Promise<UserMonumentLeaderboardRecord[]> {
        return this._monumentTable.findManyByUserGroupId(userGroupIds);
    }

    public async findUserGroupsByGroupId(groupId: string,
                                         isHard: boolean,
                                         publicOnly: boolean,
                                         serverId: string | null,
                                         sortField: MonumentLeaderboardSortField,
                                         sortOrder: SortOrder,
                                         minCountInGroup: number,
                                         filters: MonumentFilters,
                                         take: number,
                                         skip: number
    ): Promise<string[]> {
        return this._monumentGroupsTable.findIdsByGroupId(groupId, isHard, publicOnly, serverId, sortField, sortOrder, minCountInGroup, filters, take, skip);
    }

    public async findManyUserGroups(ids: string[]): Promise<UserMonumentGroupRecord[]> {
        return this._monumentGroupsTable.findMany(ids);
    }

    public async countByGroupId(groupId: string, isHard: boolean, publicOnly: boolean, serverId: string | null, minCount: number, filters: MonumentFilters): Promise<number> {
        return this._monumentTable.countByGroupId(groupId, isHard, publicOnly, serverId, minCount, filters);
    }

    public async countByDungeonId(dungeonId: string, publicOnly: boolean, serverId: string | null, filters: MonumentFilters): Promise<number> {
        return this._monumentTable.countByDungeonId(dungeonId, publicOnly, serverId, filters);
    }

    public async create(gameUid: string, data: MonumentRecord): Promise<UserMonumentLeaderboardRecord> {
        const group = await this._monumentGroupsTable.getByGroupId(data.groupId, data.isHard, gameUid);
        const record = await this._monumentTable.create(group.id, gameUid, data);

        const entities: UserMonumentCharacterEntity[] = data.chars.map(char => {
            return {
                charId: char.id,
                recordId: record.id,
                userGroupId: group.id
            };
        });

        await this._characterTable.createMany(entities);

        return record;
    }

    public async delete(id: string): Promise<void> {
        return this._monumentTable.delete(id);
    }

    public async deleteByGameUid(gameUid: string, dungeonId?: string): Promise<void> {
        return this._monumentTable.deleteByGameUid(gameUid, dungeonId);
    }

    public async findCharactersByRecordId(recordId: string, charId?: string): Promise<UserMonumentCharacterRecord[]> {
        return this._characterTable.findByRecordId(recordId, charId);
    }

    public async findCharactersByUserGroupId(userGroupId: string): Promise<UserMonumentCharacterRecord[]> {
        return this._characterTable.findByUserGroupId(userGroupId);
    }

    public async getCharactersUsageByDungeonId(dungeonId: string): Promise<Amount[]> {
        return this._characterTable.getCharactersUsageByDungeonId(dungeonId);
    }

    public async getCharactersUsageByGroupId(groupId: string, isHard: boolean): Promise<Amount[]> {
        return this._characterTable.getCharactersUsageByGroupId(groupId, isHard);
    }

    public async getCharactersNumberInRecordByDungeonId(dungeonId: string): Promise<Amount[]> {
        return this._characterTable.getCharactersNumberInRecordByDungeonId(dungeonId);
    }

    public async getCharactersNumberInRecordByGroupId(groupId: string, isHard: boolean): Promise<Amount[]> {
        return this._characterTable.getCharactersNumberInRecordByGroupId(groupId, isHard);
    }
}