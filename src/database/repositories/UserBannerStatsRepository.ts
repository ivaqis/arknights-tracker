import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserBannerStatsRepository extends Repository<Prisma.UserBannerStatDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userBannerStat);
    }
}