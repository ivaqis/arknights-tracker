import { BannerPullsIdRecord } from "@database/records/BannerPullsIdRecord";
import { UserBannerProfileRecord } from "@database/records/UserBannerProfileRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@generated/prisma-v2";

export class BannerPullsIdsTable extends Table<Prisma.BannerPullsIdDelegate> {

    public constructor(prismaClient: PrismaClient) {
        super(prismaClient, prismaClient.bannerPullsId);
    }

    public async find(id: string): Promise<BannerPullsIdRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                id
            }
        });

        if (!entity) {
            return null;
        }

        return BannerPullsIdRecord.createFromEntity(entity);
    }

    public async findIncludeBannerProfile(id: string): Promise<{
        pullsId: BannerPullsIdRecord,
        profile: UserBannerProfileRecord
    } | null> {
        const entity = await this.table.findUnique({
            where: {
                id
            },
            include: {
                bannerProfile: true
            }
        });

        if (!entity) {
            return null;
        }

        return {
            pullsId: BannerPullsIdRecord.createFromEntity(entity),
            profile: new UserBannerProfileRecord(entity.bannerProfile)
        };
    }

    public async findFirst(ids: string[]): Promise<BannerPullsIdRecord | null> {
        const entity = await this.table.findFirst({
            where: {
                id: {
                    in: ids
                }
            }
        });

        if (!entity) {
            return null;
        }

        return BannerPullsIdRecord.createFromEntity(entity);
    }

    public async findFirstIncludeBannerProfile(ids: string[]): Promise<{
        pullsId: BannerPullsIdRecord,
        profile: UserBannerProfileRecord
    } | null> {
        const entity = await this.table.findFirst({
            where: {
                id: {
                    in: ids
                }
            },
            include: {
                bannerProfile: true
            }
        });

        if (!entity) {
            return null;
        }

        return {
            pullsId: BannerPullsIdRecord.createFromEntity(entity),
            profile: new UserBannerProfileRecord(entity.bannerProfile)
        };
    }

    public async create(id: string, period: number, profileId: bigint): Promise<BannerPullsIdRecord> {
        const entity = await this.table.create({
            data: {
                id,
                period,
                profileId
            }
        });

        return BannerPullsIdRecord.createFromEntity(entity);
    }

    public async set(id: string, period: number, profileId: bigint): Promise<BannerPullsIdRecord> {
        const entity = await this.table.upsert({
            where: {
                id
            },
            update: {
                period,
                profileId
            },
            create: {
                id,
                period,
                profileId
            }
        });

        return BannerPullsIdRecord.createFromEntity(entity);
    }

    public async delete(id: string): Promise<void> {
        await this.table.delete({
            where: {
                id
            }
        });
    }
}