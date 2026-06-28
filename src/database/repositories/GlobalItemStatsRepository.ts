import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class GlobalItemStatsRepository extends Repository<Prisma.GlobalItemStatsDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.globalItemStats);
    }
}