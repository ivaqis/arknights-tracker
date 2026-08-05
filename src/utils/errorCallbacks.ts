import { database } from "@/serviceInstances";
import { ImportError } from "@errors/ImportError";

export async function importErrorCallback(error: ImportError): Promise<void> {
    if (!database.isActive()) {
        return;
    }

    await database.errors.createImportError(error);
}