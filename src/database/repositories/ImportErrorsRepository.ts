import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class ImportErrorsRepository extends Repository<Prisma.ImportErrorDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.importError);
    }
}