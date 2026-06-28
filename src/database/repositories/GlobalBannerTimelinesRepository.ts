import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class GlobalBannerTimelinesRepository extends Repository<Prisma.GlobalBannerTimelineDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.globalBannerTimeline);
    }
}