import { UserContractLeaderboardRecord } from "@database/records/UserContractLeaderboardRecord.js";
import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord.js";
import { UserRecord } from "@database/records/UserRecord.js";
import { Table } from "@database/tables/Table.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";
import { ContractRecord } from "@models/contingencyContract/ContractRecord.js";
import { ContractLeaderboardSortField } from "@models/contractLeaderboard/ContractLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";

export class UserContractLeaderboardsTable extends Table<Prisma.UserContractLeaderboardDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userContractLeaderboard);
    }

    private static getOrderOptions(sortField: ContractLeaderboardSortField, sortOrder: SortOrder) {
        switch (sortField) {
            case ContractLeaderboardSortField.TIME:
                return [
                    {
                        clearTimeSec: sortOrder
                    },
                    {
                        indicatorCount: "desc" as const
                    },
                    {
                        updatedAt: "asc" as const
                    }
                ];
            case ContractLeaderboardSortField.INDICATOR_COUNT:
                return [
                    {
                        indicatorCount: sortOrder
                    },
                    {
                        clearTimeSec: "asc" as const
                    },
                    {
                        updatedAt: "asc" as const
                    }
                ];
            case ContractLeaderboardSortField.LEVEL:
                return [
                    {
                        userGameProfile: {
                            level: sortOrder
                        }
                    },
                    {
                        indicatorCount: "desc" as const
                    },
                    {
                        clearTimeSec: "asc" as const
                    },
                    {
                        updatedAt: "asc" as const
                    }
                ];
        }
    }

    private static getWhereCondition(contractId: string, publicOnly: boolean, serverId: string | null) {
        if (publicOnly) {
            return {
                contractId,
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
            contractId,
            userGameProfile: serverId ? {
                serverId
            } : undefined
        };
    }

    public async find(id: string): Promise<UserContractLeaderboardRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                id
            }
        });

        if (!entity) {
            return null;
        }

        return UserContractLeaderboardRecord.createFromEntity(entity);
    }

    public async findByRecordId(recordId: string): Promise<UserContractLeaderboardRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                recordId: recordId
            }
        });

        if (!entity) {
            return null;
        }

        return UserContractLeaderboardRecord.createFromEntity(entity);
    }

    public async findByContractId(contractId: string, publicOnly: boolean, serverId: string | null): Promise<UserContractLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: UserContractLeaderboardsTable.getWhereCondition(contractId, publicOnly, serverId)
        });

        return entities.map(UserContractLeaderboardRecord.createFromEntity);
    }

    public async countByContractId(contractId: string, publicOnly: boolean, serverId: string | null, charCount?: number | null): Promise<number> {
        const query = Prisma.sql`
            WITH RankedRuns AS (
                SELECT 
                    l.id,
                    ROW_NUMBER() OVER (
                        PARTITION BY l."gameUid"
                        ORDER BY l."indicatorCount" DESC, l."clearTimeSec" ASC, l."updatedAt" ASC
                    ) as rn
                FROM "UserContractLeaderboard" l
                LEFT JOIN "UserGameProfile" G ON l."gameUid" = G."gameUid"
                LEFT JOIN "User" U ON G.uid = U.uid
                INNER JOIN (
                    SELECT C3."userRecordId", count(*)::integer as n
                    FROM "UserContractCharacter" C3
                    GROUP BY C3."userRecordId"
                ) CharCount ON CharCount."userRecordId" = l.id
                WHERE l."contractId" = ${contractId}
                  ${serverId ? Prisma.sql`AND G."serverId" = ${serverId}` : Prisma.sql``}
                  ${publicOnly ? Prisma.sql`AND U."isPrivate" = false AND U."hideLeaderboard" = false` : Prisma.sql``}
                  ${charCount ? Prisma.sql`AND CharCount.n = ${charCount}` : Prisma.sql``}
            )
            SELECT count(*)::integer as total_count
            FROM RankedRuns
            WHERE rn = 1
        `;

        const result = await this.prisma.$queryRaw<{ total_count: number }[]>(query);
        return Number(result[0]?.total_count || 0);
    }

    public async findByGameUid(gameUid: string, contractId?: string): Promise<UserContractLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                gameUid: gameUid,
                contractId: contractId
            }
        });

        return entities.map(UserContractLeaderboardRecord.createFromEntity);
    }

    public async findBestByGameUid(gameUid: string, contractId?: string): Promise<UserContractLeaderboardRecord | null> {
        const entity = await this.table.findFirst({
            where: {
                gameUid: gameUid,
                contractId: contractId
            },
            orderBy: [
                { indicatorCount: "desc" },
                { clearTimeSec: "asc" }
            ]
        });

        if (!entity) {
            return null;
        }

        return UserContractLeaderboardRecord.createFromEntity(entity);
    }

    public async findContractRecordsIncludeGameProfileAndUser(contractId: string,
                                                              publicOnly: boolean,
                                                              serverId: string | null,
                                                              sortField?: ContractLeaderboardSortField,
                                                              sortOrder?: SortOrder,
                                                              take?: number,
                                                              skip?: number,
                                                              charCount?: number | null
    ): Promise<{
        contractRecord: UserContractLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        let orderSql = Prisma.sql`ORDER BY r."indicatorCount" DESC, r."clearTimeSec" ASC, r."updatedAt" ASC`;
        if (sortField && sortOrder) {
            switch (sortField) {
                case ContractLeaderboardSortField.INDICATOR_COUNT:
                    orderSql = sortOrder === SortOrder.DESC
                        ? Prisma.sql`ORDER BY r."indicatorCount" DESC, r."clearTimeSec" ASC, r."updatedAt" ASC`
                        : Prisma.sql`ORDER BY r."indicatorCount" ASC, r."clearTimeSec" ASC, r."updatedAt" ASC`;
                    break;
                case ContractLeaderboardSortField.TIME:
                    orderSql = sortOrder === SortOrder.DESC
                        ? Prisma.sql`ORDER BY r."clearTimeSec" DESC, r."indicatorCount" DESC, r."updatedAt" ASC`
                        : Prisma.sql`ORDER BY r."clearTimeSec" ASC, r."indicatorCount" DESC, r."updatedAt" ASC`;
                    break;
                case ContractLeaderboardSortField.LEVEL:
                    orderSql = sortOrder === SortOrder.DESC
                        ? Prisma.sql`ORDER BY G.level DESC, r."indicatorCount" DESC, r."clearTimeSec" ASC, r."updatedAt" ASC`
                        : Prisma.sql`ORDER BY G.level ASC, r."indicatorCount" DESC, r."clearTimeSec" ASC, r."updatedAt" ASC`;
                    break;
            }
        }

        const query = Prisma.sql`
            WITH RankedRuns AS (
                SELECT 
                    l.id,
                    l."recordId",
                    l."gameUid",
                    l."contractId",
                    l."indicatorCount",
                    l."clearTimeSec",
                    l.data,
                    l."updatedAt",
                    ROW_NUMBER() OVER (
                        PARTITION BY l."gameUid"
                        ORDER BY l."indicatorCount" DESC, l."clearTimeSec" ASC, l."updatedAt" ASC
                    ) as rn
                FROM "UserContractLeaderboard" l
                LEFT JOIN "UserGameProfile" G ON l."gameUid" = G."gameUid"
                LEFT JOIN "User" U ON G.uid = U.uid
                INNER JOIN (
                    SELECT C3."userRecordId", count(*)::integer as n
                    FROM "UserContractCharacter" C3
                    GROUP BY C3."userRecordId"
                ) CharCount ON CharCount."userRecordId" = l.id
                WHERE l."contractId" = ${contractId}
                  ${serverId ? Prisma.sql`AND G."serverId" = ${serverId}` : Prisma.sql``}
                  ${publicOnly ? Prisma.sql`AND U."isPrivate" = false AND U."hideLeaderboard" = false` : Prisma.sql``}
                  ${charCount ? Prisma.sql`AND CharCount.n = ${charCount}` : Prisma.sql``}
            )
            SELECT r.id
            FROM RankedRuns r
            LEFT JOIN "UserGameProfile" G ON r."gameUid" = G."gameUid"
            WHERE r.rn = 1
            ${orderSql}
            ${skip !== undefined ? Prisma.sql`OFFSET ${skip}` : Prisma.sql``}
            ${take !== undefined ? Prisma.sql`LIMIT ${take}` : Prisma.sql``}
        `;

        const idsResult = await this.prisma.$queryRaw<{ id: string }[]>(query);
        const ids = idsResult.map(r => r.id);

        if (ids.length === 0) {
            return [];
        }

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
            const entity = entityMap.get(id)!;
            return {
                contractRecord: UserContractLeaderboardRecord.createFromEntity(entity),
                gameProfile: UserGameProfileRecord.createFromEntity(entity.userGameProfile),
                user: new UserRecord(entity.userGameProfile.user)
            };
        });
    }

    public async create(gameUid: string, data: ContractRecord): Promise<UserContractLeaderboardRecord> {
        const entity = await this.table.create({
            data: {
               gameUid,
               recordId: data.id,
               contractId: data.contractId,
               indicatorCount: data.indicatorCount,
               clearTimeSec: data.passTs,
               data: JSON.stringify(data.getEntity())
            }
        });

        return UserContractLeaderboardRecord.createFromEntity(entity);
    }

    public async delete(recordId: string): Promise<void> {
        await this.table.delete({
            where: {
                recordId: recordId
            }
        });
    }

    public async deleteByGameUid(gameUid: string): Promise<void> {
        await this.table.deleteMany({
            where: {
                gameUid: gameUid
            }
        });
    }

    public async findRunsWithRanksByGameUids(gameUids: string[], contractId: string): Promise<{
        id: string;
        recordId: string;
        gameUid: string;
        contractId: string;
        indicatorCount: number;
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
                l."recordId",
                l."gameUid",
                l."contractId",
                l."indicatorCount",
                l."clearTimeSec",
                l.data,
                l."updatedAt",
                (
                    SELECT count(*)::integer + 1 
                    FROM (
                        SELECT DISTINCT ON (l2."gameUid") l2."indicatorCount", l2."clearTimeSec", l2."updatedAt"
                        FROM "UserContractLeaderboard" l2
                        LEFT JOIN "UserGameProfile" gp2 ON l2."gameUid" = gp2."gameUid"
                        LEFT JOIN "User" u2 ON gp2.uid = u2.uid
                        WHERE l2."contractId" = l."contractId"
                          AND ((u2."isPrivate" = false AND u2."hideLeaderboard" = false) OR l2."gameUid" = l."gameUid")
                        ORDER BY l2."gameUid", l2."indicatorCount" DESC, l2."clearTimeSec" ASC, l2."updatedAt" ASC
                    ) best_runs
                    WHERE (
                        best_runs."indicatorCount" > l."indicatorCount"
                        OR (best_runs."indicatorCount" = l."indicatorCount" AND best_runs."clearTimeSec" < l."clearTimeSec")
                        OR (best_runs."indicatorCount" = l."indicatorCount" AND best_runs."clearTimeSec" = l."clearTimeSec" AND best_runs."updatedAt" < l."updatedAt")
                    )
                ) as rank,
                (
                    SELECT count(DISTINCT l3."gameUid")::integer 
                    FROM "UserContractLeaderboard" l3
                    LEFT JOIN "UserGameProfile" gp3 ON l3."gameUid" = gp3."gameUid"
                    LEFT JOIN "User" u3 ON gp3.uid = u3.uid
                    WHERE l3."contractId" = l."contractId"
                      AND ((u3."isPrivate" = false AND u3."hideLeaderboard" = false) OR l3."gameUid" = l."gameUid")
                ) as total_count
            FROM (
                SELECT DISTINCT ON (l_inner."gameUid") l_inner.*
                FROM "UserContractLeaderboard" l_inner
                WHERE l_inner."gameUid" IN (${Prisma.join(gameUids)})
                  AND l_inner."contractId" = ${contractId}
                ORDER BY l_inner."gameUid", l_inner."indicatorCount" DESC, l_inner."clearTimeSec" ASC, l_inner."updatedAt" ASC
            ) l
        `;

        const rows = await this.prisma.$queryRaw<{
            id: string;
            recordId: string;
            gameUid: string;
            contractId: string;
            indicatorCount: number;
            clearTimeSec: number;
            data: string;
            updatedAt: Date;
            rank: number;
            total_count: number;
        }[]>(query);

        return rows.map(r => ({
            id: r.id,
            recordId: r.recordId,
            gameUid: r.gameUid,
            contractId: r.contractId,
            indicatorCount: r.indicatorCount,
            clearTimeSec: r.clearTimeSec,
            data: r.data,
            updatedAt: r.updatedAt,
            rank: Number(r.rank),
            totalCount: Number(r.total_count)
        }));
    }
}