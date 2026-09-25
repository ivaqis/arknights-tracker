import { ImportErrorEntity } from "@database/entities/ImportErrorEntity.js";
import { Table } from "@database/tables/Table.js";
import { ImportError } from "@errors/ImportError.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";

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