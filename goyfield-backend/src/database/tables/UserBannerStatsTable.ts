import { GlobalBannerStatsEntity } from "@database/entities/GlobalBannerStatsEntity.js";
import { UserBannerTypeStatEntity } from "@database/entities/UserBannerTypeStatEntity.js";
import { UserBannerStatRecord } from "@database/records/UserBannerStatRecord.js";
import { Table } from "@database/tables/Table.js";
import { UserBannerProfilesTable } from "@database/tables/UserBannerProfilesTable.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";
import { DbBannerType } from "@models/banners/DbBannerType.js";
import { IncludeRange } from "@models/IncludeRange.js";

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

    public async findSpecialProfileBannerStats(bannerId: string): Promise<UserBannerStatRecord | null> {
        const entity = await this.table.findFirst({
            where: {
                bannerId,
                bannerProfile: {
                    publicId: UserBannerProfilesTable.SPECIAL_PROFILE_ID
                }
            }
        });

        if (!entity) {
            return null;
        }

        return new UserBannerStatRecord(entity);
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
                ],
                bannerProfile: {
                    publicId: {
                        not: UserBannerProfilesTable.SPECIAL_PROFILE_ID
                    }
                }
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

        const specialEntity = await this.findSpecialProfileBannerStats(bannerId);

        return {
            bannerId,
            totalUsers: entity._count.profileId,
            unfreePulls: (entity._sum.unfreePulls ?? 0) + (specialEntity?.unfreePulls.initValue ?? 0),
            total6: (entity._sum.total6 ?? 0) + (specialEntity?.total6.initValue ?? 0),
            total5: (entity._sum.total5 ?? 0) + (specialEntity?.total5.initValue ?? 0),
            won5050: (entity._sum.won5050 ?? 0) + (specialEntity?.won5050.initValue ?? 0),
            total5050: (entity._sum.total5050 ?? 0) + (specialEntity?.total5050.initValue ?? 0),
            freePulls: (entity._sum.freePulls ?? 0) + (specialEntity?.freePulls.initValue ?? 0),
            free6: (entity._sum.free6 ?? 0) + (specialEntity?.free6.initValue ?? 0),
            free5: (entity._sum.free5 ?? 0) + (specialEntity?.free5.initValue ?? 0),
            freeWin5050: (entity._sum.freeWin5050 ?? 0) + (specialEntity?.freeWin5050.initValue ?? 0),
            updatedAt: entity._max.updatedAt ?? new Date()
        };
    }

    public async getRatingStats(bannerType: string | null,
                                totalPulls: number,
                                total6Count: number,
                                total5Count: number,
                                total5050Count: number,
                                won5050Count: number
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
                                         LEFT JOIN "UserBannerProfile" P ON S."profileId" = P."profileId"
                                WHERE (S."unfreePulls" + S."freePulls" > 0)
                                  AND ${bannerType ? Prisma.sql`S."bannerType" = ${bannerType}` : Prisma.sql`TRUE`}
                                  AND P."publicId" != ${UserBannerProfilesTable.SPECIAL_PROFILE_ID}
                                GROUP BY S."profileId")

            SELECT count(*)                                                                                         AS total_users,
                   count(*) FILTER ( WHERE total_pulls >= ${totalPulls} )                                           AS gte_total_pulls,
                   count(*) FILTER ( WHERE total_pulls <= ${totalPulls} )                                           AS lte_total_pulls,
                   count(*) FILTER ( WHERE luck_6_ratio >= 1.0 * ${total6Count} / ${totalPulls} )                   AS gte_luck_6_ratio,
                   count(*) FILTER ( WHERE luck_6_ratio <= 1.0 * ${total6Count} / ${totalPulls} )                   AS lte_luck_6_ratio,
                   count(*) FILTER ( WHERE luck_5_ratio >= 1.0 * ${total5Count} / ${totalPulls} )                   AS gte_luck_5_ratio,
                   count(*) FILTER ( WHERE luck_5_ratio <= 1.0 * ${total5Count} / ${totalPulls} )                   AS lte_luck_5_ratio,
                   count(*) FILTER ( WHERE total_5050 > 0 )                                                         AS total_5050_users,
                   count(*) FILTER ( WHERE win_5050_ratio >= 1.0 * ${won5050Count} / nullif(${total5050Count}, 0) ) AS gte_win_5050_ratio,
                   count(*) FILTER ( WHERE win_5050_ratio <= 1.0 * ${won5050Count} / nullif(${total5050Count}, 0) ) AS lte_win_5050_ratio
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