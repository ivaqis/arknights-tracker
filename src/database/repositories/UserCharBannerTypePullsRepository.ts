import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserCharBannerTypePullsRepository extends Repository<Prisma.UserCharBannerTypePullsDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userCharBannerTypePulls);
    }
}