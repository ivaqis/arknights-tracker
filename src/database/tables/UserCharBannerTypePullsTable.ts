import { UserCharBannerTypePullsEntity } from "@database/entities/UserCharBannerTypePullsEntity";
import { UserCharBannerTypePullsRecord } from "@database/records/UserCharBannerTypePullsRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserCharBannerTypePullsTable extends Table<Prisma.UserCharBannerTypePullsDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userCharBannerTypePulls);
    }

    public async get(profileId: bigint, bannerType: string): Promise<UserCharBannerTypePullsRecord> {
        const entity = await this.getEntity(profileId, bannerType);

        return new UserCharBannerTypePullsRecord(entity);
    }

    public async update(record: UserCharBannerTypePullsRecord) {
        await this.table.update({
            where: {
                profileId_bannerType: {
                    profileId: record.profileId,
                    bannerType: record.bannerType
                }
            },
            data: {
                last6Pull: record.last6Pull.value,
                last5Pull: record.last5Pull.value,
                lastWin5050Pull: record.lastWin5050Pull.value,
                lastPullTimeTs: record.lastPullTimeTs.value
            }
        });
    }

    private async getEntity(profileId: bigint, bannerType: string): Promise<UserCharBannerTypePullsEntity> {
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