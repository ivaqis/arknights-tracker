import { BannerTokenIdRecord } from "@database/records/BannerTokenIdRecord.js";
import { UserBannerProfileRecord } from "@database/records/UserBannerProfileRecord.js";
import { Table } from "@database/tables/Table.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";

export class BannerTokenIdsTable extends Table<Prisma.BannerTokenIdDelegate> {

    public constructor(prismaClient: PrismaClient) {
        super(prismaClient, prismaClient.bannerTokenId);
    }

    public async find(id: string): Promise<BannerTokenIdRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                id
            }
        });

        if (!entity) {
            return null;
        }

        return BannerTokenIdRecord.createFromEntity(entity);
    }

    public async findIncludeBannerProfile(id: string): Promise<{
        tokenId: BannerTokenIdRecord,
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
            tokenId: BannerTokenIdRecord.createFromEntity(entity),
            profile: new UserBannerProfileRecord(entity.bannerProfile)
        };
    }

    public async create(id: string, profileId: bigint): Promise<BannerTokenIdRecord> {
        const entity = await this.table.create({
            data: {
                id,
                profileId
            }
        });

        return BannerTokenIdRecord.createFromEntity(entity);
    }

    public async set(id: string, profileId: bigint): Promise<BannerTokenIdRecord> {
        const entity = await this.table.upsert({
            where: {
                id
            },
            update: {
                profileId
            },
            create: {
                id,
                profileId
            }
        });

        return BannerTokenIdRecord.createFromEntity(entity);
    }

    public async delete(id: string): Promise<void> {
        await this.table.delete({
            where: {
                id
            }
        });
    }
}