import { UserCharBannerPullsEntity } from "@database/entities/UserCharBannerPullsEntity.js";
import { UserCharBannerPullsRecord } from "@database/records/UserCharBannerPullsRecord.js";
import { Table } from "@database/tables/Table.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";

export class UserCharBannerPullsTable extends Table<Prisma.UserCharBannerPullsDelegate> {

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