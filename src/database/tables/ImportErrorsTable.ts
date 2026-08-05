import { ImportErrorEntity } from "@database/entities/ImportErrorEntity";
import { Table } from "@database/tables/Table";
import { ImportError } from "@errors/ImportError";
import { Prisma, PrismaClient } from "@prisma/client";

export class ImportErrorsTable extends Table<Prisma.ImportErrorDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.importError);
    }

    public async findMany(take?: number, skip?: number): Promise<ImportErrorEntity[]> {
        return await this.table.findMany({
            where: {},
            orderBy: {
                id: "desc"
            },
            take,
            skip
        });
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