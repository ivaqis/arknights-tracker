import { UserWeaponBannerPullsEntity } from "@database/entities/UserWeaponBannerPullsEntity";
import { UserWeaponBannerPullsRecord } from "@database/records/UserWeaponBannerPullsRecord";
import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserWeaponBannerPullsRepository extends Repository<Prisma.UserWeaponBannerPullsDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userWeaponBannerPulls);
    }

    public async get(profileId: bigint, bannerId: string): Promise<UserWeaponBannerPullsRecord> {
        const entity = await this.getEntity(profileId, bannerId);

        return new UserWeaponBannerPullsRecord(entity);
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