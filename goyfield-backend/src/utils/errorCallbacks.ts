import { database } from "@/serviceInstances.js";
import { ImportError } from "@errors/ImportError.js";

export async function importErrorCallback(error: ImportError): Promise<void> {
    if (!database.isActive()) {
        return;
    }

    await database.errors.createImportError(error);
}