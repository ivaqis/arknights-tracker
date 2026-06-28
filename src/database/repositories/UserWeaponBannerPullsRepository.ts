import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserWeaponBannerPullsRepository extends Repository<Prisma.UserWeaponBannerPullsDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userWeaponBannerPulls);
    }
}