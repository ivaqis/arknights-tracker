import { ImportErrorEntity } from "@database/entities/ImportErrorEntity";

export interface GetImportErrorsResponse {
    list: ImportErrorEntity[];
}