import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserBannerProfilesRepository extends Repository<Prisma.UserBannerProfileDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userBannerProfile);
    }
}