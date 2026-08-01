import { logger } from "@/logger";
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
}