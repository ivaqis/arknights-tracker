import { Repository } from "@database/repositories/Repository";
import { ImportError } from "@errors/ImportError";
import { Prisma, PrismaClient } from "@prisma/client";

export class ImportErrorsRepository extends Repository<Prisma.ImportErrorDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.importError);
    }

    public async create(error: ImportError) {
        await this.table.create({
            data: {
                message: error.message,
                url: error.url,
                stack: error.stack,
                serverId: error.serverId
            }
        });
    }
}