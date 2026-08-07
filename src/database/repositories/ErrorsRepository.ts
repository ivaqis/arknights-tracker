import { ImportErrorEntity } from "@database/entities/ImportErrorEntity.js";
import { Repository } from "@database/repositories/Repository.js";
import { ImportErrorsTable } from "@database/tables/ImportErrorsTable.js";
import { ImportError } from "@errors/ImportError.js";
import { PrismaClient } from "@generated/prisma-v2/index.js";

export class ErrorsRepository extends Repository {
    private readonly _importErrorsTable: ImportErrorsTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._importErrorsTable = new ImportErrorsTable(prisma);
    }

    public async findManyImportErrors(take?: number, skip?: number): Promise<ImportErrorEntity[]> {
        return this._importErrorsTable.findMany(take, skip);
    }

    public async createImportError(error: ImportError): Promise<void> {
        return this._importErrorsTable.create(error);
    }
}