import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class GlobalPityDistributionsRepository extends Repository<Prisma.GlobalPityDistributionDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.globalPityDistribution);
    }
}