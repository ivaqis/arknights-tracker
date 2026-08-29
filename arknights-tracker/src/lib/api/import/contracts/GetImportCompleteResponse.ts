import type { GetImportCompleteData } from "$lib/api/import/contracts/GetImportCompleteData";
import type { StreamResponse } from "$lib/api/StreamResponse";

export interface GetImportCompleteResponse extends StreamResponse<GetImportCompleteData> {
    type: "complete";
}