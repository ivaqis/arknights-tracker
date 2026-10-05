import { MonumentFilters } from "@database/MonumentFilters.js";
import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord.js";
import { UserWarEchoesLeaderboardRecord } from "@database/records/UserWarEchoesLeaderboardRecord.js";
import { UserRecord } from "@database/records/UserRecord.js";
import { Table } from "@database/tables/Table.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";
import { WarEchoesRecord } from "@models/warEchoes/WarEchoesRecord.js";
import { WarEchoesLeaderboardSortField } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";

export class UserWarEchoesLeaderboardsTable extends Table<Prisma.UserWarEchoesLeaderboardDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userWarEchoesLeaderboard);
    }

    private static getDungeonOrderOptions(sortField: WarEchoesLeaderboardSortField, sortOrder: SortOrder) {
        switch (sortField) {
            case WarEchoesLeaderboardSortField.LEVEL:
                return {
                    userGameProfile: {
                        level: sortOrder
                    }
                };
            case WarEchoesLeaderboardSortField.TIME:
                return {
                    clearTimeSec: sortOrder
                };
        }
    }

    private static getDungeonWhereCondition(dungeonId: string, publicOnly: boolean, serverId: string | null) {
        if (publicOnly) {
            return {
                dungeonId,
                userGameProfile: {
                    serverId: serverId ?? undefined,
                    user: {
                        isPrivate: false
                    }
                }
            };
        }

        return {
            dungeonId,
            userGameProfile: serverId ? {
                serverId
            } : undefined
        };
    }

    private static getSumClearTimeWhereCondition(groupId: string, difficulty: string, publicOnly: boolean, serverId: string | null) {
        if (publicOnly) {
            return {
                groupId,
                difficulty,
                userGameProfile: {
                    serverId: serverId ?? undefined,
                    user: {
                        isPrivate: false
                    }
                }
            };
        }

        return {
            groupId,
            difficulty,
            userGameProfile: serverId ? {
                serverId
            } : undefined
        };
    }

    public async find(id: string): Promise<UserWarEchoesLeaderboardRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                id
            }
        });

        if (!entity) {
            return null;
        }

        return UserWarEchoesLeaderboardRecord.createFromEntity(entity);
    }

    public async findMany(ids: string[]): Promise<UserWarEchoesLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        });

        return entities.map(UserWarEchoesLeaderboardRecord.createFromEntity);
    }

    public async findManyIncludeGameProfileAndUser(ids: string[]): Promise<{
        record: UserWarEchoesLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        const entities = await this.table.findMany({
            where: {
                id: {
                    in: ids
                }
            },
            include: {
                userGameProfile: {
                    include: {
                        user: true
                    }
                }
            }
        });

        return entities.map(e => {
            return {
                record: UserWarEchoesLeaderboardRecord.createFromEntity(e),
                gameProfile: UserGameProfileRecord.createFromEntity(e.userGameProfile),
                user: new UserRecord(e.userGameProfile.user)
            };
        });
    }

    public async findIncludeGameProfileAndUser(id: string): Promise<{
        record: UserWarEchoesLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    } | null> {
        const entity = await this.table.findUnique({
            where: {
                id
            },
            include: {
                userGameProfile: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!entity) {
            return null;
        }

        return {
            record: UserWarEchoesLeaderboardRecord.createFromEntity(entity),
            gameProfile: UserGameProfileRecord.createFromEntity(entity.userGameProfile),
            user: new UserRecord(entity.userGameProfile.user)
        };
    }

    public async findByGameUid(gameUid: string, dungeonId?: string): Promise<UserWarEchoesLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                gameUid: gameUid,
                dungeonId: dungeonId
            }
        });

        return entities.map(UserWarEchoesLeaderboardRecord.createFromEntity);
    }

    public async findByDungeonId(dungeonId: string): Promise<UserWarEchoesLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                dungeonId
            }
        });

        return entities.map(UserWarEchoesLeaderboardRecord.createFromEntity);
    }

    public async findByGroupId(groupId: string, difficulty?: string, gameUid?: string): Promise<UserWarEchoesLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                groupId,
                difficulty,
                gameUid
            }
        });

        return entities.map(UserWarEchoesLeaderboardRecord.createFromEntity);
    }

    public async findByUserGroupId(userGroupId: string): Promise<UserWarEchoesLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                userGroupId
            }
        });

        return entities.map(UserWarEchoesLeaderboardRecord.createFromEntity);
    }

    public async findByDungeonIdIncludeGameProfileAndUser(dungeonId: string,
                                                          publicOnly: boolean,
                                                          serverId: string | null,
                                                          sortField?: WarEchoesLeaderboardSortField,
                                                          sortOrder?: SortOrder,
                                                          take?: number,
                                                          skip?: number
    ): Promise<{
        record: UserWarEchoesLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        const entities = await this.table.findMany({
            take,
            skip,
            where: UserWarEchoesLeaderboardsTable.getDungeonWhereCondition(dungeonId, publicOnly, serverId),
            orderBy: sortField && sortOrder
                ? UserWarEchoesLeaderboardsTable.getDungeonOrderOptions(sortField, sortOrder)
                : undefined,
            include: {
                userGameProfile: {
                    include: {
                        user: true
                    }
                }
            }
        });

        return entities.map(entity => {
            return {
                record: UserWarEchoesLeaderboardRecord.createFromEntity(entity),
                gameProfile: UserGameProfileRecord.createFromEntity(entity.userGameProfile),
                user: new UserRecord(entity.userGameProfile.user)
            };
        });
    }

    public async findManyByUserGroupId(userGroupIds: string[]): Promise<UserWarEchoesLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                userGroupId: {
                    in: userGroupIds
                }
            }
        });

        return entities.map(UserWarEchoesLeaderboardRecord.createFromEntity);
    }

    public async findIdsByDungeonId(dungeonId: string,
                                    publicOnly: boolean,
                                    serverId: string | null,
                                    sortField: WarEchoesLeaderboardSortField,
                                    sortOrder: SortOrder,
                                    filters: MonumentFilters,
                                    take?: number,
                                    skip?: number
    ): Promise<string[]> {
        const query = Prisma.sql`
            SELECT DISTINCT L.id, G.level, L."clearTimeSec" clear_time_sec, CharCount.n count
            FROM "UserWarEchoesLeaderboard" L
                     LEFT JOIN "UserGameProfile" G ON L."gameUid" = G."gameUid"
                     LEFT JOIN "User" U ON G.uid = U.uid
                     INNER JOIN "UserWarEchoesCharacter" C ON L.id = C."recordId"
                     INNER JOIN (SELECT C3."recordId", count(*) n
                                 FROM "UserWarEchoesCharacter" C3
                                 GROUP BY C3."recordId") CharCount ON CharCount."recordId" = L.id
            WHERE L."dungeonId" = ${dungeonId}
                ${serverId ? Prisma.sql`AND G."serverId" = ${serverId}` : Prisma.sql``}
                ${publicOnly ? Prisma.sql`AND U."isPrivate" = false` : Prisma.sql``}
                ${filters.chars ? Prisma.sql`AND C."charId" IN (${Prisma.join(filters.chars, ", ")})` : Prisma.sql``}
                ${filters.charCount ? Prisma.sql`AND CharCount.n IN (${Prisma.join(filters.charCount, ", ")})` : Prisma.sql``}
            ${UserWarEchoesLeaderboardsTable.getOrderSql(sortField, sortOrder)}
            ${skip !== undefined ? Prisma.sql`OFFSET ${skip}` : Prisma.sql``} 
            ${take !== undefined ? Prisma.sql`LIMIT ${take}` : Prisma.sql``}`;

        const entities = await this.prisma.$queryRaw<{
            id: string,
            level: number,
            clear_time_sec: number,
            count: bigint
        }[]>(query);

        return entities.map(e => e.id);
    }

    private static getOrderSql(sortField: WarEchoesLeaderboardSortField, sortOrder: SortOrder) {
        switch (sortField) {
            case WarEchoesLeaderboardSortField.LEVEL:
                return sortOrder === SortOrder.DESC
                    ? Prisma.sql`ORDER BY G.level DESC`
                    : Prisma.sql`ORDER BY G.level ASC`;
            case WarEchoesLeaderboardSortField.TIME:
                return sortOrder === SortOrder.DESC
                    ? Prisma.sql`ORDER BY L."clearTimeSec" DESC`
                    : Prisma.sql`ORDER BY L."clearTimeSec" ASC`;
        }
    }

    public async sumClearTimeByUserGroupIdSorted(groupId: string,
                                                 difficulty: string,
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
        const groups = await this.table.groupBy({
            take,
            skip,
            by: ["userGroupId"],
            where: UserWarEchoesLeaderboardsTable.getSumClearTimeWhereCondition(groupId, difficulty, publicOnly, serverId),
            having: {
                id: {
                    _count: { gte: minCountInGroup }
                },
                clearTimeSec: {
                    _sum: { gte: 0 },
                }
            },
            _sum: {
                clearTimeSec: true
            },
            orderBy: [
                {
                    _sum: {
                        clearTimeSec: sortOrder as "asc" | "desc"
                    }
                }
            ]
        });

        return groups.map(group => {
            if (group._sum.clearTimeSec === null) {
                throw new Error(`Sum clearTimeSec is null ${JSON.stringify(group, null, 2)}`);
            }

            return {
                userGroupId: group.userGroupId,
                clearTimeSec: group._sum.clearTimeSec as number
            };
        });
    }

    public async countByGroupId(groupId: string, difficulty: string, publicOnly: boolean, serverId: string | null, minCount: number, filters: MonumentFilters): Promise<number> {
        const entities = await this.prisma.$queryRaw<{ group_count: number }[]>`
            SELECT count(*) as group_count
            FROM (SELECT l."userGroupId"
                  FROM "UserWarEchoesLeaderboard" l
                           LEFT JOIN "UserGameProfile" game ON game."gameUid" = l."gameUid"
                           LEFT JOIN "User" U ON U.uid = game.uid
                           INNER JOIN "UserWarEchoesCharacter" C ON L.id = C."recordId"
                           INNER JOIN (SELECT C3."recordId", count(*) n
                                       FROM "UserWarEchoesCharacter" C3
                                       GROUP BY C3."recordId") CharCount ON CharCount."recordId" = L.id
                  WHERE l."groupId" = ${groupId}
                    AND l."difficulty" = ${difficulty}
                      ${serverId ? Prisma.sql`AND game."serverId" = ${serverId}` : Prisma.sql``} 
                      ${publicOnly ? Prisma.sql`AND U."isPrivate" = false` : Prisma.sql``}
                      ${filters.chars ? Prisma.sql`AND C."charId" IN (${Prisma.join(filters.chars, ', ')})` : Prisma.sql``}
                      ${filters.charCount ? Prisma.sql`AND CharCount.n IN (${Prisma.join(filters.charCount, ", ")})` : Prisma.sql``}
                  GROUP BY l."userGroupId"
                  HAVING count (l.id) >= ${minCount}) a`;

        return Number(entities[0].group_count);
    }

    public async countByDungeonId(dungeonId: string, publicOnly: boolean, serverId: string | null, filters: MonumentFilters): Promise<number> {
        const query = Prisma.sql`
            SELECT count(DISTINCT L.id)
            FROM "UserWarEchoesLeaderboard" L
                     LEFT JOIN "UserGameProfile" Game ON Game."gameUid" = l."gameUid"
                     LEFT JOIN "User" U ON U.uid = Game.uid
                     INNER JOIN "UserWarEchoesCharacter" C ON L.id = C."recordId"
                     INNER JOIN (SELECT C3."recordId", count(*) n
                                 FROM "UserWarEchoesCharacter" C3
                                 GROUP BY C3."recordId") CharCount ON CharCount."recordId" = L.id
            WHERE L."dungeonId" = ${dungeonId}
                ${serverId ? Prisma.sql`AND Game."serverId" = ${serverId}` : Prisma.sql``}
                ${publicOnly ? Prisma.sql`AND U."isPrivate" = false` : Prisma.sql``}
                ${filters.chars ? Prisma.sql`AND C."charId" IN (${Prisma.join(filters.chars, ', ')})` : Prisma.sql``}
                ${filters.charCount ? Prisma.sql`AND CharCount.n IN (${Prisma.join(filters.charCount, ", ")})` : Prisma.sql``}`;

        const result = await this.prisma.$queryRaw<{ count: bigint }[]>(query);

        return Number(result[0].count);
    }

    public async create(userGroupId: string, gameUid: string, data: WarEchoesRecord): Promise<UserWarEchoesLeaderboardRecord> {
        const entity = await this.table.create({
            data: {
                userGroupId,
                gameUid,
                dungeonId: data.dungeonId,
                groupId: data.groupId,
                difficulty: data.difficulty,
                clearTimeSec: data.passTS,
                data: JSON.stringify(data.getEntity())
            }
        });

        return UserWarEchoesLeaderboardRecord.createFromEntity(entity);
    }

    public async delete(id: string): Promise<void> {
        await this.table.delete({
            where: {
                id
            }
        });
    }

    public async deleteByGameUid(gameUid: string, dungeonId?: string): Promise<void> {
        await this.table.deleteMany({
            where: {
                gameUid,
                dungeonId
            }
        });
    }
}
