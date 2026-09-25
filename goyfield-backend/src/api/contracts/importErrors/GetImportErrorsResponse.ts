import { ImportErrorEntity } from "@database/entities/ImportErrorEntity.js";

export interface GetImportErrorsResponse {
    list: ImportErrorEntity[];
}