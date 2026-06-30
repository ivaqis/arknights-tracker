import { UserBannerTypeStatEntity } from "@database/entities/UserBannerTypeStatEntity";
import { UserBannerTypeStatRecord } from "@database/records/UserBannerTypeStatRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserBannerTypeStatsTable extends Table<Prisma.UserBannerTypeStatDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userBannerTypeStat);
    }

    public async get(profileId: bigint, bannerType: string): Promise<UserBannerTypeStatRecord> {
        const entity = await this.getEntity(profileId, bannerType);

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

    private async getEntity(profileId: bigint, bannerType: string): Promise<UserBannerTypeStatEntity> {
        return this.table.upsert({
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
    }
}