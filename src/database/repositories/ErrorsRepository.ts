import { Repository } from "@database/repositories/Repository";
import { ImportErrorsTable } from "@database/tables/ImportErrorsTable";
import { ImportError } from "@errors/ImportError";
import { PrismaClient } from "@prisma/client";

export class ErrorsRepository extends Repository {
    private readonly _importErrorsTable: ImportErrorsTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._importErrorsTable = new ImportErrorsTable(prisma);
    }

    public async createImportError(error: ImportError): Promise<void> {
        return this._importErrorsTable.create(error);
    }
}