import { MonumentFilters } from "@database/MonumentFilters";
import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord";
import { UserMonumentLeaderboardRecord } from "@database/records/UserMonumentLeaderboardRecord";
import { UserRecord } from "@database/records/UserRecord";
import { Table } from "@database/tables/Table";
import { MonumentRecord } from "@models/monument/MonumentRecord";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserMonumentLeaderboardsTable extends Table<Prisma.UserMonumentLeaderboardDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userMonumentLeaderboard);
    }

    private static getDungeonOrderOptions(sortField: MonumentLeaderboardSortField, sortOrder: SortOrder) {
        switch (sortField) {
            case MonumentLeaderboardSortField.LEVEL:
                return {
                    userGameProfile: {
                        level: sortOrder
                    }
                };
            case MonumentLeaderboardSortField.TIME:
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

    private static getSumClearTimeWhereCondition(groupId: string, isHard: boolean, publicOnly: boolean, serverId: string | null) {
        if (publicOnly) {
            return {
                groupId,
                isHard,
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
            userGameProfile: serverId ? {
                serverId
            } : undefined
        };
    }

    public async find(id: string): Promise<UserMonumentLeaderboardRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                id
            }
        });

        if (!entity) {
            return null;
        }

        return UserMonumentLeaderboardRecord.createFromEntity(entity);
    }

    public async findMany(ids: string[]): Promise<UserMonumentLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        });

        return entities.map(UserMonumentLeaderboardRecord.createFromEntity);
    }

    public async findManyIncludeGameProfileAndUser(ids: string[]): Promise<{
        record: UserMonumentLeaderboardRecord,
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
                record: UserMonumentLeaderboardRecord.createFromEntity(e),
                gameProfile: UserGameProfileRecord.createFromEntity(e.userGameProfile),
                user: new UserRecord(e.userGameProfile.user)
            };
        });
    }

    public async findIncludeGameProfileAndUser(id: string): Promise<{
        record: UserMonumentLeaderboardRecord,
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
            record: UserMonumentLeaderboardRecord.createFromEntity(entity),
            gameProfile: UserGameProfileRecord.createFromEntity(entity.userGameProfile),
            user: new UserRecord(entity.userGameProfile.user)
        };
    }

    public async findByGameUid(gameUid: string, dungeonId?: string): Promise<UserMonumentLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                gameUid: gameUid,
                dungeonId: dungeonId
            }
        });

        return entities.map(UserMonumentLeaderboardRecord.createFromEntity);
    }

    public async findByDungeonId(dungeonId: string): Promise<UserMonumentLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                dungeonId
            }
        });

        return entities.map(UserMonumentLeaderboardRecord.createFromEntity);
    }

    public async findByGroupId(groupId: string, isHard?: boolean, gameUid?: string): Promise<UserMonumentLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                groupId,
                isHard,
                gameUid
            }
        });

        return entities.map(UserMonumentLeaderboardRecord.createFromEntity);
    }

    public async findByUserGroupId(userGroupId: string): Promise<UserMonumentLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                userGroupId
            }
        });

        return entities.map(UserMonumentLeaderboardRecord.createFromEntity);
    }

    public async findManyByUserGroupIdIncludeGameProfileAndUser(userGroupIds: string[]): Promise<{
        record: UserMonumentLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        const entities = await this.table.findMany({
            where: {
                userGroupId: {
                    in: userGroupIds
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

        return entities.map(entity => {
            return {
                record: UserMonumentLeaderboardRecord.createFromEntity(entity),
                gameProfile: UserGameProfileRecord.createFromEntity(entity.userGameProfile),
                user: new UserRecord(entity.userGameProfile.user)
            };
        });
    }

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
        const entities = await this.table.findMany({
            take,
            skip,
            where: UserMonumentLeaderboardsTable.getDungeonWhereCondition(dungeonId, publicOnly, serverId),
            orderBy: sortField && sortOrder
                ? UserMonumentLeaderboardsTable.getDungeonOrderOptions(sortField, sortOrder)
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
                monumentRecord: UserMonumentLeaderboardRecord.createFromEntity(entity),
                gameProfile: UserGameProfileRecord.createFromEntity(entity.userGameProfile),
                user: new UserRecord(entity.userGameProfile.user)
            };
        });
    }

    public async findManyByUserGroupId(userGroupIds: string[]): Promise<UserMonumentLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                userGroupId: {
                    in: userGroupIds
                }
            }
        });

        return entities.map(UserMonumentLeaderboardRecord.createFromEntity);
    }

    public async findIdsByDungeonId(dungeonId: string,
                                    publicOnly: boolean,
                                    serverId: string | null,
                                    sortField: MonumentLeaderboardSortField,
                                    sortOrder: SortOrder,
                                    filters: MonumentFilters,
                                    take?: number,
                                    skip?: number
    ): Promise<string[]> {
        const query = Prisma.sql`
            SELECT DISTINCT L.id, G.level, L."clearTimeSec" clear_time_sec, CharCount.n count
            FROM "UserMonumentLeaderboard" L
                     LEFT JOIN "UserGameProfile" G ON L."gameUid" = G."gameUid"
                     LEFT JOIN "User" U ON G.uid = U.uid
                     INNER JOIN "UserMonumentCharacter" C ON L.id = C."recordId"
                     INNER JOIN (SELECT C3."recordId", count(*) n
                                 FROM "UserMonumentCharacter" C3
                                 GROUP BY C3."recordId") CharCount ON CharCount."recordId" = L.id
            WHERE L."dungeonId" = ${dungeonId}
                ${serverId ? Prisma.sql`AND G."serverId" = ${serverId}` : Prisma.sql``}
                ${publicOnly ? Prisma.sql`AND U."isPrivate" = false` : Prisma.sql``}
                ${filters.chars ? Prisma.sql`AND C."charId" IN (${Prisma.join(filters.chars, ", ")})` : Prisma.sql``}
                ${filters.charCount ? Prisma.sql`AND CharCount.n IN (${Prisma.join(filters.charCount, ", ")})` : Prisma.sql``}
            ${UserMonumentLeaderboardsTable.getOrderSql(sortField, sortOrder)}
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

    private static getOrderSql(sortField: MonumentLeaderboardSortField, sortOrder: SortOrder) {
        switch (sortField) {
            case MonumentLeaderboardSortField.LEVEL:
                return sortOrder === SortOrder.DESC
                    ? Prisma.sql`ORDER BY G.level DESC`
                    : Prisma.sql`ORDER BY G.level ASC`;
            case MonumentLeaderboardSortField.TIME:
                return sortOrder === SortOrder.DESC
                    ? Prisma.sql`ORDER BY L."clearTimeSec" DESC`
                    : Prisma.sql`ORDER BY L."clearTimeSec" ASC`;
        }
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
        const groups = await this.table.groupBy({
            take,
            skip,
            by: ["userGroupId"],
            where: UserMonumentLeaderboardsTable.getSumClearTimeWhereCondition(groupId, isHard, publicOnly, serverId),
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

    public async countByGroupId(groupId: string, isHard: boolean, publicOnly: boolean, serverId: string | null, minCount: number, filters: MonumentFilters): Promise<number> {
        const entities = await this.prisma.$queryRaw<{ group_count: number }[]>`
            SELECT count(*) as group_count
            FROM (SELECT l."userGroupId"
                  FROM "UserMonumentLeaderboard" l
                           LEFT JOIN "UserGameProfile" game ON game."gameUid" = l."gameUid"
                           LEFT JOIN "User" U ON U.uid = game.uid
                           INNER JOIN "UserMonumentCharacter" C ON L.id = C."recordId"
                           INNER JOIN (SELECT C3."recordId", count(*) n
                                       FROM "UserMonumentCharacter" C3
                                       GROUP BY C3."recordId") CharCount ON CharCount."recordId" = L.id
                  WHERE l."groupId" = ${groupId}
                    AND l."isHard" = ${isHard}
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
            FROM "UserMonumentLeaderboard" L
                     LEFT JOIN "UserGameProfile" Game ON Game."gameUid" = l."gameUid"
                     LEFT JOIN "User" U ON U.uid = Game.uid
                     INNER JOIN "UserMonumentCharacter" C ON L.id = C."recordId"
                     INNER JOIN (SELECT C3."recordId", count(*) n
                                 FROM "UserMonumentCharacter" C3
                                 GROUP BY C3."recordId") CharCount ON CharCount."recordId" = L.id
            WHERE L."dungeonId" = ${dungeonId}
                ${serverId ? Prisma.sql`AND Game."serverId" = ${serverId}` : Prisma.sql``}
                ${publicOnly ? Prisma.sql`AND U."isPrivate" = false` : Prisma.sql``}
                ${filters.chars ? Prisma.sql`AND C."charId" IN (${Prisma.join(filters.chars, ', ')})` : Prisma.sql``}
                ${filters.charCount ? Prisma.sql`AND CharCount.n IN (${Prisma.join(filters.charCount, ", ")})` : Prisma.sql``}`;

        const result = await this.prisma.$queryRaw<{ count: bigint }[]>(query);

        return Number(result[0].count);
    }

    public async create(userGroupId: string, gameUid: string, data: MonumentRecord): Promise<UserMonumentLeaderboardRecord> {
        const entity = await this.table.create({
            data: {
                userGroupId,
                gameUid,
                dungeonId: data.dungeonId,
                groupId: data.groupId,
                isHard: data.isHard,
                clearTimeSec: data.passTS,
                data: JSON.stringify(data.getEntity())
            }
        });

        return UserMonumentLeaderboardRecord.createFromEntity(entity);
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