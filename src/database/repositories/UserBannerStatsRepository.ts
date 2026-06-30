import { UserBannerStatEntity } from "@database/entities/UserBannerStatEntity";
import { UserBannerStatRecord } from "@database/records/UserBannerStatRecord";
import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserBannerStatsRepository extends Repository<Prisma.UserBannerStatDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userBannerStat);
    }

    public async get(profileId: bigint, bannerId: string): Promise<UserBannerStatRecord> {
        const entity = await this.getEntity(profileId, bannerId);

        return new UserBannerStatRecord(entity);
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

    private getEntity(profileId: bigint, bannerId: string): Promise<UserBannerStatEntity> {
        return this.table.upsert({
            where: {
                profileId_bannerId: {
                    profileId,
                    bannerId
                }
            },
            create: {
                profileId,
                bannerId
            },
            update: {}
        });
    }
}