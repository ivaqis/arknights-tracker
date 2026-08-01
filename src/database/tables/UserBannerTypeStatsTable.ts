import { UserBannerTypeStatRecord } from "@database/records/UserBannerTypeStatRecord";
import { Table } from "@database/tables/Table";
import { IncludeRange } from "@models/IncludeRange";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserBannerTypeStatsTable extends Table<Prisma.UserBannerTypeStatDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userBannerTypeStat);
    }

    public async get(profileId: bigint, bannerType: string): Promise<UserBannerTypeStatRecord> {
        const entity = await this.table.upsert({
            where: {
                profileId_bannerType: {
                    profileId,
                    bannerType
                }
            },
            create: {
                profileId,
                bannerType
            },
            update: {}
        });

        return new UserBannerTypeStatRecord(entity);
    }

    public async update(record: UserBannerTypeStatRecord) {
        await this.table.update({
            where: {
                profileId_bannerType: {
                    profileId: record.profileId,
                    bannerType: record.bannerType
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

    public async getAllByBannerId(bannerType: string): Promise<UserBannerTypeStatRecord[]> {
        const entities = await this.table
            .findMany({
                where: {
                    bannerType
                }
            });

        return entities.map(entity => new UserBannerTypeStatRecord(entity));
    }

    public async countTotalPullsByBannerType(bannerType: string | null, pullsCount: IncludeRange): Promise<number> {
        const query = Prisma.sql`
            SELECT count(*)
            FROM "UserBannerTypeStat" T
            WHERE (T."unfreePulls" > 0 OR T."freePulls" > 0)
              ${bannerType ? Prisma.sql`AND T."bannerType" = ${bannerType}` : Prisma.sql``}
              ${pullsCount.min ? Prisma.sql`AND T."unfreePulls" + T."freePulls" >= ${pullsCount.min}` : Prisma.sql``}
              ${pullsCount.max ? Prisma.sql`AND T."unfreePulls" + T."freePulls" <= ${pullsCount.max}` : Prisma.sql``}`;

        const result = await this.prisma.$queryRaw<{ count: bigint }[]>(query);

        return Number(result[0].count);
    }

    public async countWinRateByBannerType(bannerType: string | null, winRate: IncludeRange): Promise<number> {
        const query = Prisma.sql`
            SELECT count(*)
            FROM "UserBannerTypeStat" T
            WHERE T."total5050" > 0
              ${bannerType ? Prisma.sql`AND T."bannerType" = ${bannerType}` : Prisma.sql``}
              ${winRate.min ? Prisma.sql`AND 1.0 * T.won5050 / T.total5050 >= ${winRate.min}` : Prisma.sql``}
              ${winRate.max ? Prisma.sql`AND 1.0 * T.won5050 / T.total5050 <= ${winRate.max}` : Prisma.sql``}`;

        const result = await this.prisma.$queryRaw<{ count: bigint }[]>(query);

        return Number(result[0].count);
    }

    public async countLuck6ByBannerType(bannerType: string | null, luckRate: IncludeRange): Promise<number> {
        const query = Prisma.sql`
            SELECT count(*)
            FROM "UserBannerTypeStat" T
            WHERE (T."unfreePulls" > 0 OR T."freePulls" > 0)
              ${bannerType ? Prisma.sql`AND T."bannerType" = ${bannerType}` : Prisma.sql``}
              ${luckRate.min ? Prisma.sql`AND 1.0 * T.total6 / (T."unfreePulls" + T."freePulls") >= ${luckRate.min}` : Prisma.sql``}
              ${luckRate.max ? Prisma.sql`AND 1.0 * T.total6 / (T."unfreePulls" + T."freePulls") <= ${luckRate.max}` : Prisma.sql``}`;

        const result = await this.prisma.$queryRaw<{ count: bigint }[]>(query);

        return Number(result[0].count);
    }

    public async countLuck5ByBannerType(bannerType: string | null, luckRate: IncludeRange): Promise<number> {
        const query = Prisma.sql`
            SELECT count(*)
            FROM "UserBannerTypeStat" T
            WHERE (T."unfreePulls" > 0 OR T."freePulls" > 0)
              ${bannerType ? Prisma.sql`AND T."bannerType" = ${bannerType}` : Prisma.sql``}
              ${luckRate.min ? Prisma.sql`AND 1.0 * T.total5 / (T."unfreePulls" + T."freePulls") >= ${luckRate.min}` : Prisma.sql``}
              ${luckRate.max ? Prisma.sql`AND 1.0 * T.total5 / (T."unfreePulls" + T."freePulls") <= ${luckRate.max}` : Prisma.sql``}`;

        const result = await this.prisma.$queryRaw<{ count: bigint }[]>(query);

        return Number(result[0].count);
    }
}