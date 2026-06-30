import { UserBannerProfileEntity } from "@database/entities/UserBannerProfileEntity";
import { UserBannerProfileRecord } from "@database/records/UserBannerProfileRecord";
import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserBannerProfilesRepository extends Repository<Prisma.UserBannerProfileDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userBannerProfile);
    }

    public async get(profileId: bigint): Promise<UserBannerProfileRecord | null> {
        const entity = await this.getEntity(profileId);

        if (!entity) {
            return null;
        }

        return new UserBannerProfileRecord(entity);
    }

    public async create(): Promise<UserBannerProfileRecord> {
        const entity = await this.table.create({});

        return new UserBannerProfileRecord(entity);
    }

    private async getEntity(profileId: bigint): Promise<UserBannerProfileEntity | null> {
        return this.table
            .findUnique({
                where: { profileId }
            });
    }
}