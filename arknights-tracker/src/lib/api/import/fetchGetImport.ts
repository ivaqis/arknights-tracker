import type { GetImportGenericResponse } from "$lib/api/import/contracts/GetImportGenericResponse";
import { parseStream } from "$lib/api/parseStream";
import { config } from "$lib/config";

export async function fetchGetImport(token: string, serverIds: string[], lastPullTs: bigint | number): Promise<AsyncGenerator<GetImportGenericResponse, void, unknown>> {
    const url = `${config.API_BASE}/api/v2/import?token=${token}&serverIds=${serverIds.join(",")}&lastPullTs=${lastPullTs}`;

    const response = await fetch(url, {
        method: "GET"
    });

    if (response.status === 429) {
        throw new Error("RATE_LIMIT");
    }

    if (response.status >= 500) {
        throw new Error("NETWORK_ERROR");
    }

    if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
    }

    return parseStream<GetImportGenericResponse>(response);
}