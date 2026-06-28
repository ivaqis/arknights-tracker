import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class GeneratedTokensRepository extends Repository<Prisma.GeneratedTokenDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.generatedToken);
    }
}