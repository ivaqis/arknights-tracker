import type { ErrorStreamResponse } from "$lib/api/ErrorStreamResponse";
import type { ImportProgressResponse } from "$lib/api/import/contracts/ImportProgressResponse";
import type { PostImportCompleteResponse } from "$lib/api/import/contracts/PostImportCompleteResponse";

export type PostImportGenericResponse =
    | ErrorStreamResponse
    | ImportProgressResponse
    | PostImportCompleteResponse;