import { PostImportCompleteData } from "@api/contracts/import/PostImportCompleteData.js";
import { StreamResponse } from "@api/contracts/StreamResponse.js";

export interface PostImportCompleteResponse extends StreamResponse<PostImportCompleteData> {
    type: "complete";
}