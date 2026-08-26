import { ImportProgressData } from "@api/contracts/import/ImportProgressData.js";
import { StreamResponse } from "@api/contracts/StreamResponse.js";

export interface ImportProgressResponse extends StreamResponse<ImportProgressData> {
    type: "progress";
}