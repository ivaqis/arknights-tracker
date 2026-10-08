import { UserWarEchoesCharacterEntity } from "@database/entities/UserWarEchoesCharacterEntity.js";
import { MonumentFilters } from "@database/MonumentFilters.js";
import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord.js";
import { UserWarEchoesCharacterRecord } from "@database/records/UserWarEchoesCharacterRecord.js";
import { UserWarEchoesGroupRecord } from "@database/records/UserWarEchoesGroupRecord.js";
import { UserWarEchoesLeaderboardRecord } from "@database/records/UserWarEchoesLeaderboardRecord.js";
import { UserRecord } from "@database/records/UserRecord.js";
import { Repository } from "@database/repositories/Repository.js";
import { UserWarEchoesCharactersTable } from "@database/tables/UserWarEchoesCharactersTable.js";
import { UserWarEchoesGroupsTable } from "@database/tables/UserWarEchoesGroupsTable.js";
import { UserWarEchoesLeaderboardsTable } from "@database/tables/UserWarEchoesLeaderboardsTable.js";
import { PrismaClient } from "@generated/prisma-v2/index.js";
import { Amount } from "@models/Amount.js";
import { WarEchoesRecord } from "@models/warEchoes/WarEchoesRecord.js";
import { WarEchoesLeaderboardSortField } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";

export class WarEchoesLeaderboardRepository extends Repository {
    private readonly _warEchoesGroupsTable: UserWarEchoesGroupsTable;
    private readonly _warEchoesTable: UserWarEchoesLeaderboardsTable;
    private readonly _characterTable: UserWarEchoesCharactersTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._warEchoesGroupsTable = new UserWarEchoesGroupsTable(prisma);
        this._warEchoesTable = new UserWarEchoesLeaderboardsTable(prisma);
        this._characterTable = new UserWarEchoesCharactersTable(prisma);
    }

    public async find(id: string): Promise<UserWarEchoesLeaderboardRecord | null> {
        return this._warEchoesTable.find(id);
    }

    public async findIncludeGameProfileAndUser(id: string): Promise<{
        record: UserWarEchoesLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    } | null> {
        return this._warEchoesTable.findIncludeGameProfileAndUser(id);
    }

    public async findByGameUid(gameUid: string, dungeonId?: string, groupId?: string): Promise<UserWarEchoesLeaderboardRecord[]> {
        return this._warEchoesTable.findByGameUid(gameUid, dungeonId, groupId);
    }

    public async findByDungeonId(dungeonId: string): Promise<UserWarEchoesLeaderboardRecord[]> {
        return this._warEchoesTable.findByDungeonId(dungeonId);
    }

    public async findByGroupId(groupId: string, difficulty?: string, gameUid?: string): Promise<UserWarEchoesLeaderboardRecord[]> {
        return this._warEchoesTable.findByGroupId(groupId, difficulty, gameUid);
    }

    public async findByUserGroupId(userGroupId: string): Promise<UserWarEchoesLeaderboardRecord[]> {
        return this._warEchoesTable.findByUserGroupId(userGroupId);
    }

    public async findManyGroupsIncludeGameProfileAndUser(userGroupIds: string[]): Promise<{
        group: UserWarEchoesGroupRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        return this._warEchoesGroupsTable.findManyIncludeGameProfileAndUser(userGroupIds);
    }

    public async findByDungeonIdIncludeGameProfileAndUser(dungeonId: string,
                                                          publicOnly: boolean,
                                                          serverId: string | null,
                                                          sortField: WarEchoesLeaderboardSortField,
                                                          sortOrder: SortOrder,
                                                          filters: MonumentFilters,
                                                          take?: number,
                                                          skip?: number,
                                                          groupId?: string
    ): Promise<{
        record: UserWarEchoesLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        const ids = await this._warEchoesTable.findIdsByDungeonId(dungeonId, publicOnly, serverId, sortField, sortOrder, filters, take, skip, groupId);

        return await this._warEchoesTable.findManyIncludeGameProfileAndUser(ids);
    }

    public async findManyByUserGroupId(userGroupIds: string[]): Promise<UserWarEchoesLeaderboardRecord[]> {
        return this._warEchoesTable.findManyByUserGroupId(userGroupIds);
    }

    public async findUserGroupsByGroupId(groupId: string,
                                         difficulty: string,
                                         publicOnly: boolean,
                                         serverId: string | null,
                                         sortField: WarEchoesLeaderboardSortField,
                                         sortOrder: SortOrder,
                                         minCountInGroup: number,
                                         filters: MonumentFilters,
                                         take: number,
                                         skip: number
    ): Promise<string[]> {
        return this._warEchoesGroupsTable.findIdsByGroupId(groupId, difficulty, publicOnly, serverId, sortField, sortOrder, minCountInGroup, filters, take, skip);
    }

    public async findManyUserGroups(ids: string[]): Promise<UserWarEchoesGroupRecord[]> {
        return this._warEchoesGroupsTable.findMany(ids);
    }

    public async countByGroupId(groupId: string, difficulty: string, publicOnly: boolean, serverId: string | null, minCount: number, filters: MonumentFilters): Promise<number> {
        return this._warEchoesTable.countByGroupId(groupId, difficulty, publicOnly, serverId, minCount, filters);
    }

    public async countByDungeonId(dungeonId: string, publicOnly: boolean, serverId: string | null, filters: MonumentFilters, groupId?: string): Promise<number> {
        return this._warEchoesTable.countByDungeonId(dungeonId, publicOnly, serverId, filters, groupId);
    }

    public async create(gameUid: string, data: WarEchoesRecord): Promise<UserWarEchoesLeaderboardRecord> {
        const group = await this._warEchoesGroupsTable.getByGroupId(data.groupId, data.difficulty, gameUid);
        const record = await this._warEchoesTable.create(group.id, gameUid, data);

        const entities: UserWarEchoesCharacterEntity[] = data.chars.map(char => {
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
        return this._warEchoesTable.delete(id);
    }

    public async deleteByGameUid(gameUid: string, dungeonId?: string, groupId?: string): Promise<void> {
        return this._warEchoesTable.deleteByGameUid(gameUid, dungeonId, groupId);
    }

    public async findCharactersByRecordId(recordId: string, charId?: string): Promise<UserWarEchoesCharacterRecord[]> {
        return this._characterTable.findByRecordId(recordId, charId);
    }

    public async findCharactersByUserGroupId(userGroupId: string): Promise<UserWarEchoesCharacterRecord[]> {
        return this._characterTable.findByUserGroupId(userGroupId);
    }

    public async getCharactersUsageByDungeonId(dungeonId: string, groupId?: string): Promise<Amount[]> {
        return this._characterTable.getCharactersUsageByDungeonId(dungeonId, groupId);
    }

    public async getCharactersUsageByGroupId(groupId: string, difficulty: string): Promise<Amount[]> {
        return this._characterTable.getCharactersUsageByGroupId(groupId, difficulty);
    }

    public async getCharactersNumberInRecordByDungeonId(dungeonId: string, groupId?: string): Promise<Amount[]> {
        return this._characterTable.getCharactersNumberInRecordByDungeonId(dungeonId, groupId);
    }

    public async getCharactersNumberInRecordByGroupId(groupId: string, difficulty: string): Promise<Amount[]> {
        return this._characterTable.getCharactersNumberInRecordByGroupId(groupId, difficulty);
    }
}
