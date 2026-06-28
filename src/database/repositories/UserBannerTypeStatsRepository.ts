import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserBannerTypeStatsRepository extends Repository<Prisma.UserBannerTypeStatDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userBannerTypeStat);
    }
}