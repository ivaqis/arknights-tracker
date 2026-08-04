import { GlobalBannerStatsEntity } from "@database/entities/GlobalBannerStatsEntity";
import { UserBannerTypeStatEntity } from "@database/entities/UserBannerTypeStatEntity";
import { UserBannerStatRecord } from "@database/records/UserBannerStatRecord";
import { Table } from "@database/tables/Table";
import { DbBannerType } from "@models/banners/DbBannerType";
import { IncludeRange } from "@models/IncludeRange";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserBannerStatsTable extends Table<Prisma.UserBannerStatDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userBannerStat);
    }

    public async get(profileId: bigint, bannerId: string, bannerType: string): Promise<UserBannerStatRecord> {
        const entity = await this.table.upsert({
            where: {
                profileId_bannerId: {
                    profileId,
                    bannerId
                }
            },
            create: {
                profileId,
                bannerId,
                bannerType
            },
            update: {}
        });

        return new UserBannerStatRecord(entity);
    }

    public async getTypeStats(profileId: bigint, bannerType: DbBannerType): Promise<UserBannerTypeStatEntity> {
        const entity = await this.table.aggregate({
            where: {
                profileId,
                bannerType
            },
            _sum: {
                unfreePulls: true,
                total6: true,
                total5: true,
                won5050: true,
                total5050: true,
                freePulls: true,
                free6: true,
                free5: true,
                freeWin5050: true
            },
            _max: {
                updatedAt: true
            }
        });

        return {
            profileId,
            bannerType,
            updatedAt: entity._max.updatedAt ?? new Date(),
            unfreePulls: entity._sum.unfreePulls ?? 0,
            total6: entity._sum.total6 ?? 0,
            total5: entity._sum.total5 ?? 0,
            won5050: entity._sum.won5050 ?? 0,
            total5050: entity._sum.total5050 ?? 0,
            freePulls: entity._sum.freePulls ?? 0,
            free6: entity._sum.free6 ?? 0,
            free5: entity._sum.free5 ?? 0,
            freeWin5050: entity._sum.freeWin5050 ?? 0
        };
    }

    public async update(record: UserBannerStatRecord) {
        await this.table.update({
            where: {
                profileId_bannerId: {
                    profileId: record.profileId,
                    bannerId: record.bannerId
                }
            },
            data: {
                unfreePulls: { increment: record.unfreePulls.delta },
                total6: { increment: record.total6.delta },
                total5: { increment: record.total5.delta },
                won5050: { increment: record.won5050.delta },
                total5050: { increment: record.total5050.delta },
                freePulls: { increment: record.freePulls.delta },
                free6: { increment: record.free6.delta },
                free5: { increment: record.free5.delta },
                freeWin5050: { increment: record.freeWin5050.delta }
            }
        });
    }

    public async getAllByBannerId(bannerId: string): Promise<UserBannerStatRecord[]> {
        const entities = await this.table
            .findMany({
                where: {
                    bannerId
                }
            });

        return entities.map(entity => new UserBannerStatRecord(entity));
    }

    public async getGlobalBannerStats(bannerId: string): Promise<GlobalBannerStatsEntity> {
        const entity = await this.table.aggregate({
            where: {
                bannerId,
                OR: [
                    {
                        unfreePulls: { gt: 0 }
                    },
                    {
                        freePulls: { gt: 0 }
                    }
                ]
            },
            _count: {
                profileId: true
            },
            _sum: {
                unfreePulls: true,
                total6: true,
                total5: true,
                won5050: true,
                total5050: true,
                freePulls: true,
                free6: true,
                free5: true,
                freeWin5050: true
            },
            _max: {
                updatedAt: true
            }
        });

        return {
            bannerId,
            totalUsers: entity._count.profileId,
            unfreePulls: entity._sum.unfreePulls ?? 0,
            total6: entity._sum.total6 ?? 0,
            total5: entity._sum.total5 ?? 0,
            won5050: entity._sum.won5050 ?? 0,
            total5050: entity._sum.total5050 ?? 0,
            freePulls: entity._sum.freePulls ?? 0,
            free6: entity._sum.free6 ?? 0,
            free5: entity._sum.free5 ?? 0,
            freeWin5050: entity._sum.freeWin5050 ?? 0,
            updatedAt: entity._max.updatedAt ?? new Date()
        };
    }

    public async countTotalPullsByBannerType(bannerType: string | null, pullsCount: IncludeRange): Promise<number> {
        const query = Prisma.sql`
            SELECT count(*)
            FROM (SELECT S."profileId"
                  FROM "UserBannerStat" S
                  WHERE (S."unfreePulls" > 0 OR S."freePulls" > 0)
                    AND ${bannerType ? Prisma.sql`S."bannerType" = ${bannerType}` : Prisma.sql`TRUE`}
                  GROUP BY S."profileId"
                  HAVING ${pullsCount.min !== undefined ? Prisma.sql`sum(S."unfreePulls") + sum(S."freePulls") >= ${pullsCount.min}` : Prisma.sql`TRUE`}
                     AND ${pullsCount.max !== undefined ? Prisma.sql`sum(S."unfreePulls") + sum(S."freePulls") <= ${pullsCount.max}` : Prisma.sql`TRUE`}) AS groups`;

        const result = await this.prisma.$queryRaw<{ count: bigint }[]>(query);

        return Number(result[0].count);
    }

    public async countWinRateByBannerType(bannerType: string | null, winRate: IncludeRange): Promise<number> {
        const query = Prisma.sql`
            SELECT count(*)
            FROM (SELECT S."profileId"
                  FROM "UserBannerStat" S
                  WHERE S.total5050 > 0
                    AND ${bannerType ? Prisma.sql`S."bannerType" = ${bannerType}` : Prisma.sql`TRUE`}
                  GROUP BY S."profileId"
                  HAVING ${winRate.min !== undefined ? Prisma.sql`1.0 * sum(S.won5050) / sum(S.total5050) >= ${winRate.min}` : Prisma.sql`TRUE`}
                     AND ${winRate.max !== undefined ? Prisma.sql`1.0 * sum(S.won5050) / sum(S.total5050) <= ${winRate.max}` : Prisma.sql`TRUE`}) AS groups`;

        const result = await this.prisma.$queryRaw<{ count: bigint }[]>(query);

        return Number(result[0].count);
    }

    public async countLuck6ByBannerType(bannerType: string | null, luckRate: IncludeRange): Promise<number> {
        const query = Prisma.sql`
            SELECT count(*)
            FROM (SELECT S."profileId"
                  FROM "UserBannerStat" S
                  WHERE (S."unfreePulls" > 0 OR S."freePulls" > 0)
                    AND ${bannerType ? Prisma.sql`S."bannerType" = ${bannerType}` : Prisma.sql`TRUE`}
                  GROUP BY S."profileId"
                  HAVING ${luckRate.min !== undefined ? Prisma.sql`1.0 * sum(S.total6) / (sum(S."unfreePulls") + sum(S."freePulls")) >= ${luckRate.min}` : Prisma.sql`TRUE`}
                     AND ${luckRate.max !== undefined ? Prisma.sql`1.0 * sum(S.total6) / (sum(S."unfreePulls") + sum(S."freePulls")) <= ${luckRate.max}` : Prisma.sql`TRUE`}) AS groups`;

        const result = await this.prisma.$queryRaw<{ count: bigint }[]>(query);

        return Number(result[0].count);
    }

    public async countLuck5ByBannerType(bannerType: string | null, luckRate: IncludeRange): Promise<number> {
        const query = Prisma.sql`
            SELECT count(*)
            FROM (SELECT S."profileId"
                  FROM "UserBannerStat" S
                  WHERE (S."unfreePulls" > 0 OR S."freePulls" > 0)
                    AND ${bannerType ? Prisma.sql`S."bannerType" = ${bannerType}` : Prisma.sql`TRUE`}
                  GROUP BY S."profileId"
                  HAVING ${luckRate.min !== undefined ? Prisma.sql`1.0 * sum(S.total5) / (sum(S."unfreePulls") + sum(S."freePulls")) >= ${luckRate.min}` : Prisma.sql`TRUE`}
                     AND ${luckRate.max !== undefined ? Prisma.sql`1.0 * sum(S.total5) / (sum(S."unfreePulls") + sum(S."freePulls")) <= ${luckRate.max}` : Prisma.sql`TRUE`}) AS groups`;

        const result = await this.prisma.$queryRaw<{ count: bigint }[]>(query);

        return Number(result[0].count);
    }

    public async getRatingStats(bannerType: string | null,
                                totalPulls: number,
                                luck6Ratio: number,
                                luck5Ratio: number,
                                win5050Ratio: number
    ): Promise<{
        totalUsers: number;
        gteTotalPulls: number;
        lteTotalPulls: number;
        gteLuck6Ratio: number;
        lteLuck6Ratio: number;
        gteLuck5Ratio: number;
        lteLuck5Ratio: number;
        total5050Users: number;
        gteWin5050Ratio: number;
        lteWin5050Ratio: number;
    }> {
        const query = Prisma.sql`
            WITH pull_stats AS (SELECT S."profileId"                                                     AS profile_id,
                                       sum(S."unfreePulls") + sum(S."freePulls")                         AS total_pulls,
                                       1.0 * sum(S.total6) / (sum(S."unfreePulls") + sum(S."freePulls")) AS luck_6_ratio,
                                       1.0 * sum(S.total5) / (sum(S."unfreePulls") + sum(S."freePulls")) AS luck_5_ratio,
                                       sum(S.total5050)                                                  AS total_5050,
                                       1.0 * sum(S.won5050) / nullif(sum(S.total5050), 0)                AS win_5050_ratio
                                FROM "UserBannerStat" S
                                WHERE (S."unfreePulls" > 0 OR S."freePulls" > 0)
                                  AND ${bannerType ? Prisma.sql`S."bannerType" = ${bannerType}` : Prisma.sql`TRUE`}
                                GROUP BY S."profileId")

            SELECT count(*)                                                    AS total_users,
                   count(*) FILTER ( WHERE total_pulls >= ${totalPulls} )      AS gte_total_pulls,
                   count(*) FILTER ( WHERE total_pulls <= ${totalPulls} )      AS lte_total_pulls,
                   count(*) FILTER ( WHERE luck_6_ratio >= ${luck6Ratio} )     AS gte_luck_6_ratio,
                   count(*) FILTER ( WHERE luck_6_ratio <= ${luck6Ratio} )     AS lte_luck_6_ratio,
                   count(*) FILTER ( WHERE luck_5_ratio >= ${luck5Ratio} )     AS gte_luck_5_ratio,
                   count(*) FILTER ( WHERE luck_5_ratio <= ${luck5Ratio} )     AS lte_luck_5_ratio,
                   count(*) FILTER ( WHERE total_5050 > 0 )                    AS total_5050_users,
                   count(*) FILTER ( WHERE win_5050_ratio >= ${win5050Ratio} ) AS gte_win_5050_ratio,
                   count(*) FILTER ( WHERE win_5050_ratio <= ${win5050Ratio} ) AS lte_win_5050_ratio
            FROM pull_stats`;

        const result = await this.prisma.$queryRaw<{
            total_users: bigint,
            gte_total_pulls: bigint,
            lte_total_pulls: bigint,
            gte_luck_6_ratio: bigint,
            lte_luck_6_ratio: bigint,
            gte_luck_5_ratio: bigint,
            lte_luck_5_ratio: bigint,
            total_5050_users: bigint,
            gte_win_5050_ratio: bigint,
            lte_win_5050_ratio: bigint
        }[]>(query);

        return {
            totalUsers: Number(result[0].total_users),
            gteTotalPulls: Number(result[0].gte_total_pulls),
            lteTotalPulls: Number(result[0].lte_total_pulls),
            gteLuck6Ratio: Number(result[0].gte_luck_6_ratio),
            lteLuck6Ratio: Number(result[0].lte_luck_6_ratio),
            gteLuck5Ratio: Number(result[0].gte_luck_5_ratio),
            lteLuck5Ratio: Number(result[0].lte_luck_5_ratio),
            total5050Users: Number(result[0].total_5050_users),
            gteWin5050Ratio: Number(result[0].gte_win_5050_ratio),
            lteWin5050Ratio: Number(result[0].lte_win_5050_ratio)
        };
    }
}