import { UserCharBannerPullsEntity } from "@database/entities/UserCharBannerPullsEntity";
import { UserCharBannerPullsRecord } from "@database/records/UserCharBannerPullsRecord";
import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserCharBannerPullsRepository extends Repository<Prisma.UserCharBannerPullsDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userCharBannerPulls);
    }

    public async get(profileId: bigint, bannerId: string): Promise<UserCharBannerPullsRecord> {
        const entity = await this.getEntity(profileId, bannerId);

        return new UserCharBannerPullsRecord(entity);
    }

    public async update(record: UserCharBannerPullsRecord) {
        await this.table.update({
            where: {
                profileId_bannerId: {
                    profileId: record.profileId,
                    bannerId: record.bannerId
                }
            },
            data: {
                last6LimitedPull: record.last6LimitedPull.value
            }
        });
    }

    private async getEntity(profileId: bigint, bannerId: string): Promise<UserCharBannerPullsEntity> {
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