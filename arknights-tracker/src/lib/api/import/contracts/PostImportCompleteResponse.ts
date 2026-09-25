import type { PostImportCompleteData } from "$lib/api/import/contracts/PostImportCompleteData";
import type { StreamResponse } from "$lib/api/StreamResponse";

export interface PostImportCompleteResponse extends StreamResponse<PostImportCompleteData> {
    type: "complete";
}