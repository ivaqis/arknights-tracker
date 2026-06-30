import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class BannerProfilesRepository extends Repository<Prisma.BannerProfileDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.bannerProfile);
    }
}