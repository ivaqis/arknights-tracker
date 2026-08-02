import { UserBannerProfileEntity } from "@database/entities/UserBannerProfileEntity";
import { UserBannerProfileRecord } from "@database/records/UserBannerProfileRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserBannerProfilesTable extends Table<Prisma.UserBannerProfileDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userBannerProfile);
    }

    public async find(profileId: bigint): Promise<UserBannerProfileRecord | null> {
        const entity = await this.getEntity(profileId);

        if (!entity) {
            return null;
        }

        return new UserBannerProfileRecord(entity);
    }

    public async findByPublicId(publicId: string): Promise<UserBannerProfileRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                publicId
            }
        });

        if (!entity) {
            return null;
        }

        return new UserBannerProfileRecord(entity);
    }

    public async create(): Promise<UserBannerProfileRecord> {
        const entity = await this.table.create({
            data: {

            }
        });

        return new UserBannerProfileRecord(entity);
    }

    private async getEntity(profileId: bigint): Promise<UserBannerProfileEntity | null> {
        return this.table
            .findUnique({
                where: { profileId }
            });
    }
}