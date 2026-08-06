import { UserBannerProfileRecord } from "@database/records/UserBannerProfileRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@generated/prisma-v2";

export class UserBannerProfilesTable extends Table<Prisma.UserBannerProfileDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userBannerProfile);
    }

    public async find(profileId: bigint): Promise<UserBannerProfileRecord | null> {
        const entity = await this.table.findUnique({
            where: { profileId }
        });

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

    public async findByPrivateId(privateId: string): Promise<UserBannerProfileRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                privateId
            }
        });

        if (!entity) {
            return null;
        }

        return new UserBannerProfileRecord(entity);
    }

    public async update(record: UserBannerProfileRecord): Promise<void> {
        await this.table.update({
            where: {
                profileId: record.profileId
            },
            data: {
                version: record.version.value
            }
        });
    }

    public async create(): Promise<UserBannerProfileRecord> {
        const entity = await this.table.create({
            data: {

            }
        });

        return new UserBannerProfileRecord(entity);
    }
}