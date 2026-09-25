import type { ImportProgressData } from "$lib/api/import/contracts/ImportProgressData";
import type { StreamResponse } from "$lib/api/StreamResponse";

export interface ImportProgressResponse extends StreamResponse<ImportProgressData> {
    type: "progress";
}