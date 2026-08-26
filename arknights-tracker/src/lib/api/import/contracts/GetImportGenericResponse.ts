import type { ErrorStreamResponse } from "$lib/api/ErrorStreamResponse";
import type { GetImportCompleteResponse } from "$lib/api/import/contracts/GetImportCompleteResponse";
import type { ImportProgressResponse } from "$lib/api/import/contracts/ImportProgressResponse";

export type GetImportGenericResponse =
    | ErrorStreamResponse
    | ImportProgressResponse
    | GetImportCompleteResponse;