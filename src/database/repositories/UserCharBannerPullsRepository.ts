import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserCharBannerPullsRepository extends Repository<Prisma.UserCharBannerPullsDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userCharBannerPulls);
    }
}