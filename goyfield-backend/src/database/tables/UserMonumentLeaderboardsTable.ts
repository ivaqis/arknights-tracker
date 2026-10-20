import { MonumentFilters } from "@database/MonumentFilters.js";
import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord.js";
import { UserMonumentLeaderboardRecord } from "@database/records/UserMonumentLeaderboardRecord.js";
import { UserRecord } from "@database/records/UserRecord.js";
import { Table } from "@database/tables/Table.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";
import { MonumentRecord } from "@models/monument/MonumentRecord.js";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";

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
                        isPrivate: false,
                        hideLeaderboard: false
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
                        isPrivate: false,
                        hideLeaderboard: false
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

        const entityMap = new Map(entities.map(e => [e.id, e]));
        return ids.map(id => entityMap.get(id)).filter((e): e is NonNullable<typeof e> => Boolean(e)).map(UserMonumentLeaderboardRecord.createFromEntity);
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

        const entityMap = new Map(entities.map(e => [e.id, e]));

        return ids.map(id => {
            const e = entityMap.get(id);
            if (!e) return null;
            return {
                record: UserMonumentLeaderboardRecord.createFromEntity(e),
                gameProfile: UserGameProfileRecord.createFromEntity(e.userGameProfile),
                user: new UserRecord(e.userGameProfile.user)
            };
        }).filter((item): item is NonNullable<typeof item> => Boolean(item));
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
                ${publicOnly ? Prisma.sql`AND U."isPrivate" = false AND U."hideLeaderboard" = false` : Prisma.sql``}
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
                      ${publicOnly ? Prisma.sql`AND U."isPrivate" = false AND U."hideLeaderboard" = false` : Prisma.sql``}
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
                ${publicOnly ? Prisma.sql`AND U."isPrivate" = false AND U."hideLeaderboard" = false` : Prisma.sql``}
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

    public async findRunsWithRanksByGameUids(gameUids: string[]): Promise<{
        id: string;
        userGroupId: string;
        gameUid: string;
        dungeonId: string;
        groupId: string;
        isHard: boolean;
        clearTimeSec: number;
        data: string;
        updatedAt: Date;
        rank: number;
        totalCount: number;
    }[]> {
        if (gameUids.length === 0) {
            return [];
        }

        const query = Prisma.sql`
            SELECT 
                l.id,
                l."userGroupId",
                l."gameUid",
                l."dungeonId",
                l."groupId",
                l."isHard",
                l."clearTimeSec",
                l.data,
                l."updatedAt",
                (
                    SELECT count(*)::integer + 1 
                    FROM "UserMonumentLeaderboard" l2
                    LEFT JOIN "UserGameProfile" gp2 ON l2."gameUid" = gp2."gameUid"
                    LEFT JOIN "User" u2 ON gp2.uid = u2.uid
                    WHERE l2."dungeonId" = l."dungeonId"
                      AND ((u2."isPrivate" = false AND u2."hideLeaderboard" = false) OR l2."gameUid" = l."gameUid")
                      AND l2."clearTimeSec" < l."clearTimeSec"
                ) as rank,
                (
                    SELECT count(*)::integer 
                    FROM "UserMonumentLeaderboard" l3
                    LEFT JOIN "UserGameProfile" gp3 ON l3."gameUid" = gp3."gameUid"
                    LEFT JOIN "User" u3 ON gp3.uid = u3.uid
                    WHERE l3."dungeonId" = l."dungeonId"
                      AND ((u3."isPrivate" = false AND u3."hideLeaderboard" = false) OR l3."gameUid" = l."gameUid")
                ) as total_count
            FROM "UserMonumentLeaderboard" l
            WHERE l."gameUid" IN (${Prisma.join(gameUids)})
        `;

        const rows = await this.prisma.$queryRaw<{
            id: string;
            userGroupId: string;
            gameUid: string;
            dungeonId: string;
            groupId: string;
            isHard: boolean;
            clearTimeSec: number;
            data: string;
            updatedAt: Date;
            rank: number;
            total_count: number;
        }[]>(query);

        return rows.map(r => ({
            id: r.id,
            userGroupId: r.userGroupId,
            gameUid: r.gameUid,
            dungeonId: r.dungeonId,
            groupId: r.groupId,
            isHard: r.isHard,
            clearTimeSec: r.clearTimeSec,
            data: r.data,
            updatedAt: r.updatedAt,
            rank: Number(r.rank),
            totalCount: Number(r.total_count)
        }));
    }
}