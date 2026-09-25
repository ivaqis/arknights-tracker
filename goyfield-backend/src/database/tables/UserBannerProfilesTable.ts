import { UserBannerProfileRecord } from "@database/records/UserBannerProfileRecord.js";
import { Table } from "@database/tables/Table.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";

export class UserBannerProfilesTable extends Table<Prisma.UserBannerProfileDelegate> {
    public static readonly SPECIAL_PROFILE_ID = "special_banner_profile_stat";

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userBannerProfile);
    }

    public async find(profileId: bigint): Promise<UserBannerProfileRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                profileId,
            }
        });

        if (!entity || entity.publicId === UserBannerProfilesTable.SPECIAL_PROFILE_ID) {
            return null;
        }

        return new UserBannerProfileRecord(entity);
    }

    public async findByPublicId(publicId: string): Promise<UserBannerProfileRecord | null> {
        if (publicId === UserBannerProfilesTable.SPECIAL_PROFILE_ID) {
            return null;
        }

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

        if (!entity || entity.publicId === UserBannerProfilesTable.SPECIAL_PROFILE_ID) {
            return null;
        }

        return new UserBannerProfileRecord(entity);
    }

    public async update(record: UserBannerProfileRecord): Promise<void> {
        if (record.publicId === UserBannerProfilesTable.SPECIAL_PROFILE_ID) {
            throw new Error("Unable to update special banner profile");
        }

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