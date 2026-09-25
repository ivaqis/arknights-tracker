import { GetImportCompleteData } from "@api/contracts/import/GetImportCompleteData.js";
import { StreamResponse } from "@api/contracts/StreamResponse.js";

export interface GetImportCompleteResponse extends StreamResponse<GetImportCompleteData> {
    type: "complete";
}