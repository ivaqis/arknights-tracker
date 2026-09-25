import { UserWeaponBannerPullsEntity } from "@database/entities/UserWeaponBannerPullsEntity.js";
import { UserWeaponBannerPullsRecord } from "@database/records/UserWeaponBannerPullsRecord.js";
import { Table } from "@database/tables/Table.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";

export class UserWeaponBannerPullsTable extends Table<Prisma.UserWeaponBannerPullsDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userWeaponBannerPulls);
    }

    public async get(profileId: bigint, bannerId: string): Promise<UserWeaponBannerPullsRecord> {
        const entity = await this.getEntity(profileId, bannerId);

        return new UserWeaponBannerPullsRecord(entity);
    }

    public async getLastPullTimeTs(profileId: bigint): Promise<bigint | null> {
        const entity = await this.table.aggregate({
            where: {
                profileId: profileId
            },
            _max: {
                lastPullTimeTs: true
            }
        });

        return entity._max.lastPullTimeTs;
    }

    public async update(record: UserWeaponBannerPullsRecord) {
        await this.table.update({
            where: {
                profileId_bannerId: {
                    profileId: record.profileId,
                    bannerId: record.bannerId
                }
            },
            data: {
                last6Pull: record.last6Pull.value,
                last5Pull: record.last5Pull.value,
                lastWin5050Pull: record.lastWin5050Pull.value,
                lastPullTimeTs: record.lastPullTimeTs.value
            }
        })
    }

    private async getEntity(profileId: bigint, bannerId: string): Promise<UserWeaponBannerPullsEntity> {
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