import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class GlobalBannerStatsRepository extends Repository<Prisma.GlobalBannerStatsDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.globalBannerStats);
    }
}